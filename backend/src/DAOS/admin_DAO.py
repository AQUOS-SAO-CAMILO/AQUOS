from backend.src.config.connection import create_connection

def get_admin_profile_by_user_id(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ap.id, u.id, u.name, ap.birth_date, ap.gender, u.role, t.name AS team_name
        FROM users u
        LEFT JOIN admin_profiles ap ON ap.user_id = u.id
        LEFT JOIN teams t ON t.admin_id = u.id
        WHERE u.id = %s
    """, (user_id,))
    result = cursor.fetchone()
    conn.close()
    return result


def update_admin_profile(user_id, full_name, birth_date, gender, role_title, team_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = %s, role = %s WHERE id = %s", (full_name, role_title, user_id))
    cursor.execute("SELECT id FROM admin_profiles WHERE user_id = %s", (user_id,))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("""
            UPDATE admin_profiles
            SET birth_date = %s, gender = %s, team_id=(SELECT id FROM teams WHERE admin_id = %s LIMIT 1)
            WHERE user_id = %s
        """, (birth_date, gender, user_id, user_id))
    else:
        admin_code = f"ADM_{str(user_id)[:8].upper()}"
        cursor.execute("""
            INSERT INTO admin_profiles (id, user_id, admin_code,    
                       birth_date, gender, team_id)
            VALUES (gen_random_uuid(), %s, %s, %s, %s, (SELECT id FROM teams WHERE admin_id = %s LIMIT 1))
        """, (user_id, admin_code, birth_date, gender, user_id))

    conn.commit()
    conn.close()

def get_admin_teams(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name 
        FROM teams 
        WHERE admin_id = %s
    """, (user_id,))
    results = cursor.fetchall()
    conn.close()
    return results