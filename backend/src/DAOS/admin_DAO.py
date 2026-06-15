from backend.src.config.connection import create_connection

def get_admin_profile_by_user_id(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ap.id, u.id, u.name, ap.birth_date, ap.gender, ap.role_title, ap.team_id
        FROM users u
        LEFT JOIN admin_profiles ap ON ap.user_id = u.id
        WHERE u.id = %s
    """, (user_id,))
    result = cursor.fetchone()
    conn.close()
    return result


def update_admin_profile(user_id, full_name, birth_date, gender, role_title, team_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = %s WHERE id = %s", (full_name, user_id))
    cursor.execute("SELECT id FROM admin_profiles WHERE user_id = %s", (user_id,))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("""
            UPDATE admin_profiles
            SET birth_date = %s, gender = %s,
                role_title = %s, team_id=%s
            WHERE user_id = %s
        """, (birth_date, gender, role_title, team_id, user_id))
    else:
        admin_code = f"ADM_{str(user_id)[:8].upper()}"
        cursor.execute("""
            INSERT INTO admin_profiles (id, user_id, admin_code, 
                       birth_date, gender, role_title, team_id)
            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s)
        """, (user_id, admin_code, birth_date, gender, role_title, team_id))

    conn.commit()
    conn.close()