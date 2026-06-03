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


def upsert_athlete_profile(user_id, nome, birth_date, gender, sport_modality, body_weight_kg, height_cm):
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute("UPDATE users SET name = %s WHERE id = %s", (nome, user_id))

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
