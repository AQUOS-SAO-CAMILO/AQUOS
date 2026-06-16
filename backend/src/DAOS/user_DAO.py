from backend.src.config.connection import create_connection

def get_all_users_by_email(email):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    result = cursor.fetchone()
    conn.close()
    return result

def insert_new_user(email, password, name, role):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO users (email, password_hash, name, role) 
                   VALUES (%s, %s, %s, %s)""", (email, password, name, role))
    conn.commit()
    conn.close()
    return {
        "Insert": True,
        "name": name,
        "email": email
    }

def get_all_data_users():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name, role, is_active FROM users")
    result = cursor.fetchall()
    conn.close()
    return result

def get_all_users_by_id(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    conn.close()
    return result

def update_user_email(new_email, user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET email = %s WHERE id = %s", (new_email, user_id))
    conn.commit()
    conn.close()
    return {
        "Update": True,
        "new_email": new_email,
        "user_id": user_id
    }

def update_user_password(password, user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (password, user_id))
    conn.commit()
    conn.close()
    return {
        "Update": True,
        "user_id": user_id
    }

def update_user_name(new_name, user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = %s where id = %s", (new_name, user_id))
    conn.commit()
    conn.close()
    return {
        "Update": True, 
        "new_name": new_name,
        "user_id": user_id
    }

def update_desactive_user_account(user_id):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET is_active = FALSE WHERE id = %s", (user_id,))
    conn.commit()
    conn.close()
    return {
        "Update": True,
        "user_id": user_id
    }