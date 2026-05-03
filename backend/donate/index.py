import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p40384861_quantum_data_systems")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Система донатов голосами. 1 голос = 1 рубль.
    GET /?user_id=X — баланс и история донатов пользователя
    POST /send — отправить голоса другому пользователю
    POST /buy — пополнить баланс голосов (имитация оплаты)
    """
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/").rstrip("/")
    headers = event.get("headers") or {}
    user_id = headers.get("x-user-id") or (event.get("queryStringParameters") or {}).get("user_id")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET / — баланс + входящие/исходящие донаты
        if method == "GET":
            if not user_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "user_id required"})}

            cur.execute(f"SELECT voice_balance FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "user not found"})}

            balance = row[0]

            cur.execute(f"""
                SELECT d.id, d.voices, d.message, d.created_at,
                       u.display_name as from_name, u.username as from_username
                FROM {SCHEMA}.donations d
                JOIN {SCHEMA}.users u ON u.id = d.from_user_id
                WHERE d.to_user_id = %s
                ORDER BY d.created_at DESC LIMIT 20
            """, (user_id,))
            incoming = [
                {"id": r[0], "voices": r[1], "message": r[2],
                 "created_at": r[3].isoformat() if r[3] else None,
                 "from_name": r[4], "from_username": r[5]}
                for r in cur.fetchall()
            ]

            cur.execute(f"""
                SELECT d.id, d.voices, d.message, d.created_at,
                       u.display_name as to_name, u.username as to_username
                FROM {SCHEMA}.donations d
                JOIN {SCHEMA}.users u ON u.id = d.to_user_id
                WHERE d.from_user_id = %s
                ORDER BY d.created_at DESC LIMIT 20
            """, (user_id,))
            outgoing = [
                {"id": r[0], "voices": r[1], "message": r[2],
                 "created_at": r[3].isoformat() if r[3] else None,
                 "to_name": r[4], "to_username": r[5]}
                for r in cur.fetchall()
            ]

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "balance": balance,
                "incoming": incoming,
                "outgoing": outgoing,
            })}

        body = json.loads(event.get("body") or "{}")

        # POST /send — отправить голоса
        if method == "POST" and path.endswith("/send"):
            from_id = user_id or body.get("from_user_id")
            to_id = body.get("to_user_id")
            voices = int(body.get("voices", 0))
            message = body.get("message", "")

            if not from_id or not to_id or voices <= 0:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "from_user_id, to_user_id, voices required"})}

            if str(from_id) == str(to_id):
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нельзя дарить голоса себе"})}

            # Проверяем баланс
            cur.execute(f"SELECT voice_balance FROM {SCHEMA}.users WHERE id = %s", (from_id,))
            row = cur.fetchone()
            if not row or row[0] < voices:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Недостаточно голосов"})}

            # Списываем и начисляем
            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance - %s WHERE id = %s", (voices, from_id))
            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance + %s WHERE id = %s", (voices, to_id))
            cur.execute(
                f"INSERT INTO {SCHEMA}.donations (from_user_id, to_user_id, voices, message) VALUES (%s, %s, %s, %s) RETURNING id",
                (from_id, to_id, voices, message)
            )
            donation_id = cur.fetchone()[0]
            conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True, "donation_id": donation_id})}

        # POST /buy — пополнить баланс (имитация, интеграция с платёжкой отдельно)
        if method == "POST" and path.endswith("/buy"):
            uid = user_id or body.get("user_id")
            voices = int(body.get("voices", 0))

            if not uid or voices <= 0:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "user_id и voices обязательны"})}

            amount_rub = voices  # 1 голос = 1 рубль
            cur.execute(
                f"INSERT INTO {SCHEMA}.voice_purchases (user_id, amount_voices, amount_rub, status) VALUES (%s, %s, %s, 'paid') RETURNING id",
                (uid, voices, amount_rub)
            )
            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance + %s WHERE id = %s", (voices, uid))
            conn.commit()

            cur.execute(f"SELECT voice_balance FROM {SCHEMA}.users WHERE id = %s", (uid,))
            new_balance = cur.fetchone()[0]

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "success": True,
                "voices_added": voices,
                "amount_rub": amount_rub,
                "new_balance": new_balance,
            })}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}

    finally:
        cur.close()
        conn.close()
