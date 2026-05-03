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
    """Система голосов: донаты, подарки, вывод на карту Мир. 1 голос = 1 рубль.
    GET /           — баланс + история донатов
    GET /gifts      — каталог подарков + полученные подарки пользователя
    GET /withdrawals — история заявок на вывод
    POST /send      — отправить голоса
    POST /buy       — пополнить баланс (имитация)
    POST /gift      — подарить подарок из каталога
    POST /withdraw  — заявка на вывод голосов на карту Мир
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
        # GET / — баланс + история донатов
        if method == "GET" and not any(path.endswith(s) for s in ["/gifts", "/withdrawals"]):
            if not user_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "user_id required"})}

            cur.execute(f"SELECT voice_balance FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "user not found"})}

            balance = row[0]

            cur.execute(f"""
                SELECT d.id, d.voices, d.message, d.created_at,
                       u.display_name, u.username
                FROM {SCHEMA}.donations d
                JOIN {SCHEMA}.users u ON u.id = d.from_user_id
                WHERE d.to_user_id = %s ORDER BY d.created_at DESC LIMIT 20
            """, (user_id,))
            incoming = [{"id": r[0], "voices": r[1], "message": r[2],
                         "created_at": r[3].isoformat() if r[3] else None,
                         "from_name": r[4], "from_username": r[5]} for r in cur.fetchall()]

            cur.execute(f"""
                SELECT d.id, d.voices, d.message, d.created_at,
                       u.display_name, u.username
                FROM {SCHEMA}.donations d
                JOIN {SCHEMA}.users u ON u.id = d.to_user_id
                WHERE d.from_user_id = %s ORDER BY d.created_at DESC LIMIT 20
            """, (user_id,))
            outgoing = [{"id": r[0], "voices": r[1], "message": r[2],
                         "created_at": r[3].isoformat() if r[3] else None,
                         "to_name": r[4], "to_username": r[5]} for r in cur.fetchall()]

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "balance": balance, "incoming": incoming, "outgoing": outgoing
            })}

        # GET /gifts — каталог + полученные подарки
        if method == "GET" and path.endswith("/gifts"):
            cur.execute(f"""
                SELECT id, name, emoji, description, price_voices, sort_order
                FROM {SCHEMA}.gift_catalog WHERE is_active = TRUE ORDER BY sort_order
            """)
            catalog = [{"id": r[0], "name": r[1], "emoji": r[2],
                        "description": r[3], "price_voices": r[4]} for r in cur.fetchall()]

            received = []
            if user_id:
                cur.execute(f"""
                    SELECT g.id, gc.emoji, gc.name, g.message, g.voices_spent, g.created_at,
                           u.display_name, u.username
                    FROM {SCHEMA}.gifts g
                    JOIN {SCHEMA}.gift_catalog gc ON gc.id = g.gift_id
                    JOIN {SCHEMA}.users u ON u.id = g.from_user_id
                    WHERE g.to_user_id = %s ORDER BY g.created_at DESC LIMIT 30
                """, (user_id,))
                received = [{"id": r[0], "emoji": r[1], "name": r[2], "message": r[3],
                             "voices_spent": r[4],
                             "created_at": r[5].isoformat() if r[5] else None,
                             "from_name": r[6], "from_username": r[7]} for r in cur.fetchall()]

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "catalog": catalog, "received": received
            })}

        # GET /withdrawals — история заявок
        if method == "GET" and path.endswith("/withdrawals"):
            if not user_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "user_id required"})}
            cur.execute(f"""
                SELECT id, voices, amount_rub, card_number, card_holder, status, admin_note, created_at, processed_at
                FROM {SCHEMA}.withdrawal_requests WHERE user_id = %s ORDER BY created_at DESC
            """, (user_id,))
            rows = [{"id": r[0], "voices": r[1], "amount_rub": float(r[2]),
                     "card_number": r[3], "card_holder": r[4], "status": r[5],
                     "admin_note": r[6],
                     "created_at": r[7].isoformat() if r[7] else None,
                     "processed_at": r[8].isoformat() if r[8] else None} for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"withdrawals": rows})}

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

            cur.execute(f"SELECT voice_balance FROM {SCHEMA}.users WHERE id = %s", (from_id,))
            row = cur.fetchone()
            if not row or row[0] < voices:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Недостаточно голосов"})}

            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance - %s WHERE id = %s", (voices, from_id))
            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance + %s WHERE id = %s", (voices, to_id))
            cur.execute(f"INSERT INTO {SCHEMA}.donations (from_user_id, to_user_id, voices, message) VALUES (%s, %s, %s, %s) RETURNING id",
                        (from_id, to_id, voices, message))
            donation_id = cur.fetchone()[0]
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True, "donation_id": donation_id})}

        # POST /buy — пополнить баланс
        if method == "POST" and path.endswith("/buy"):
            uid = user_id or body.get("user_id")
            voices = int(body.get("voices", 0))
            if not uid or voices <= 0:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "user_id и voices обязательны"})}

            amount_rub = voices
            cur.execute(f"INSERT INTO {SCHEMA}.voice_purchases (user_id, amount_voices, amount_rub, status) VALUES (%s, %s, %s, 'paid') RETURNING id",
                        (uid, voices, amount_rub))
            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance + %s WHERE id = %s", (voices, uid))
            conn.commit()
            cur.execute(f"SELECT voice_balance FROM {SCHEMA}.users WHERE id = %s", (uid,))
            new_balance = cur.fetchone()[0]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "success": True, "voices_added": voices, "amount_rub": amount_rub, "new_balance": new_balance
            })}

        # POST /gift — подарить подарок из каталога
        if method == "POST" and path.endswith("/gift"):
            from_id = user_id or body.get("from_user_id")
            to_id = body.get("to_user_id")
            gift_catalog_id = body.get("gift_id")
            message = body.get("message", "")

            if not from_id or not to_id or not gift_catalog_id:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "from_user_id, to_user_id, gift_id required"})}
            if str(from_id) == str(to_id):
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нельзя дарить подарок себе"})}

            cur.execute(f"SELECT id, name, emoji, price_voices FROM {SCHEMA}.gift_catalog WHERE id = %s AND is_active = TRUE",
                        (gift_catalog_id,))
            gift_row = cur.fetchone()
            if not gift_row:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Подарок не найден"})}

            price = gift_row[3]
            cur.execute(f"SELECT voice_balance FROM {SCHEMA}.users WHERE id = %s", (from_id,))
            balance_row = cur.fetchone()
            if not balance_row or balance_row[0] < price:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": f"Недостаточно голосов. Нужно {price}, есть {balance_row[0] if balance_row else 0}"})}

            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance - %s WHERE id = %s", (price, from_id))
            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance + %s WHERE id = %s", (price, to_id))
            cur.execute(f"""INSERT INTO {SCHEMA}.gifts (gift_id, from_user_id, to_user_id, message, voices_spent)
                            VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                        (gift_catalog_id, from_id, to_id, message, price))
            gift_id = cur.fetchone()[0]
            conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "success": True, "gift_id": gift_id,
                "gift_emoji": gift_row[2], "gift_name": gift_row[1], "voices_spent": price
            })}

        # POST /withdraw — заявка на вывод
        if method == "POST" and path.endswith("/withdraw"):
            uid = user_id or body.get("user_id")
            voices = int(body.get("voices", 0))
            card_number = body.get("card_number", "").replace(" ", "")
            card_holder = body.get("card_holder", "").strip()

            if not uid or voices < 100:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Минимальная сумма вывода — 100 голосов"})}
            if not card_number or len(card_number) < 16:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи номер карты (16 цифр)"})}
            if not card_holder:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи имя держателя карты"})}

            cur.execute(f"SELECT voice_balance FROM {SCHEMA}.users WHERE id = %s", (uid,))
            row = cur.fetchone()
            if not row or row[0] < voices:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Недостаточно голосов"})}

            amount_rub = voices * 0.9  # комиссия 10%
            cur.execute(f"UPDATE {SCHEMA}.users SET voice_balance = voice_balance - %s WHERE id = %s", (voices, uid))
            cur.execute(f"""INSERT INTO {SCHEMA}.withdrawal_requests
                            (user_id, voices, amount_rub, card_number, card_holder, status)
                            VALUES (%s, %s, %s, %s, %s, 'pending') RETURNING id""",
                        (uid, voices, amount_rub, card_number, card_holder))
            req_id = cur.fetchone()[0]
            conn.commit()

            return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                "success": True, "request_id": req_id,
                "voices": voices, "amount_rub": amount_rub,
                "message": f"Заявка принята. {voices} голосов = {amount_rub:.2f} ₽ (комиссия 10%) придут на карту в течение 3 рабочих дней."
            })}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}

    finally:
        cur.close()
        conn.close()
