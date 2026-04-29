"""
Загрузка и получение видео пользователей Говорилки.
GET  /?user_id=1         — список видео пользователя
POST /                   — загрузить новое видео (base64 в теле)
"""

import json
import os
import base64
import uuid
import boto3
import psycopg2

SCHEMA = os.environ["MAIN_DB_SCHEMA"]


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    }


def resp(status, data):
    return {
        "statusCode": status,
        "headers": cors_headers(),
        "body": json.dumps(data, ensure_ascii=False),
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        params = event.get("queryStringParameters") or {}
        user_id = params.get("user_id")
        if not user_id:
            return resp(400, {"error": "user_id обязателен"})

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"""
            SELECT id, title, description, video_url, thumbnail_url,
                   duration_sec, views, likes, created_at
            FROM {SCHEMA}.videos
            WHERE user_id = %s AND is_published = TRUE
            ORDER BY created_at DESC
            """,
            (int(user_id),),
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        videos = [
            {
                "id": r[0],
                "title": r[1],
                "description": r[2],
                "video_url": r[3],
                "thumbnail_url": r[4],
                "duration_sec": r[5],
                "views": r[6],
                "likes": r[7],
                "created_at": r[8].isoformat() if r[8] else None,
            }
            for r in rows
        ]
        return resp(200, {"videos": videos})

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        user_id = body.get("user_id")
        title = body.get("title", "").strip()
        description = body.get("description", "")
        video_b64 = body.get("video_base64")
        content_type = body.get("content_type", "video/mp4")

        if not user_id or not title or not video_b64:
            return resp(400, {"error": "user_id, title и video_base64 обязательны"})

        video_data = base64.b64decode(video_b64)
        ext = content_type.split("/")[-1].split(";")[0]
        key = f"videos/{user_id}/{uuid.uuid4()}.{ext}"

        s3 = get_s3()
        s3.put_object(
            Bucket="files",
            Key=key,
            Body=video_data,
            ContentType=content_type,
        )
        access_key = os.environ["AWS_ACCESS_KEY_ID"]
        video_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.videos (user_id, title, description, video_url)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (int(user_id), title, description, video_url),
        )
        video_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return resp(201, {"id": video_id, "video_url": video_url})

    return resp(405, {"error": "Метод не поддерживается"})
