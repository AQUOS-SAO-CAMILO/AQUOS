from backend.src.config.connection import create_connection


def get_full_athlete_profile(user_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT u.name, ap.birth_date, ap.gender, ap.body_weight_kg, ap.height_cm, ap.sport_modality
        FROM users u
        LEFT JOIN athlete_profiles ap ON ap.user_id = u.id
        WHERE u.id = %s
    """, (user_id,))
    result = cursor.fetchone()
    connection.close()
    return result


def upsert_athlete_profile(user_id, name, birth_date, gender, sport_modality, body_weight_kg, height_cm):
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute("UPDATE users SET name = %s WHERE id = %s", (name, user_id))

    cursor.execute("SELECT id FROM athlete_profiles WHERE user_id = %s", (user_id,))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("""
            UPDATE athlete_profiles
            SET birth_date = %s, gender = %s, sport_modality = %s,
                body_weight_kg = %s, height_cm = %s
            WHERE user_id = %s
        """, (birth_date, gender, sport_modality, body_weight_kg, height_cm, user_id))
    else:
        athlete_code = f"ATH_{str(user_id)[:8].upper()}"
        cursor.execute("""
            INSERT INTO athlete_profiles (id, user_id, athlete_code, birth_date, gender, sport_modality, body_weight_kg, height_cm)
            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, athlete_code, birth_date, gender, sport_modality, body_weight_kg, height_cm))

    connection.commit()
    connection.close()


def get_atletas_risco_count():
    connection = create_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT COUNT(DISTINCT ap.user_id)
            FROM session_results sr
            INNER JOIN training_sessions ts ON ts.id = sr.session_id
            INNER JOIN athlete_profiles ap  ON ap.id = ts.athlete_id
            WHERE sr.dehydration_risk IN ('high', 'critical')
              AND ts.session_start >= NOW() - INTERVAL '24 hours'
        """)
        result = cursor.fetchone()
        return result[0] if result else 0
    except Exception as e:
        raise e
    finally:
        connection.close()