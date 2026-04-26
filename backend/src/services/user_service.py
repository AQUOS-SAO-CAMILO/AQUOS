import jwt
from backend.src.config.database import create_connection
from flask import current_app, jsonify
import datetime
from werkzeug.security import generate_password_hash

def authenticate_user_logic(user, password):
    connection = create_connection()
    if not connection:
        # return jsonify({"error": "Não foi possível conectar com o banco"}), 500
        raise Exception("Não foi possível conectar com o banco")

    try:
        # Verificar se o user existe no banco de dados
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE user = ?", (user,))
        found_user_result = cursor.fetchone()

        if not found_user_result:
            # return jsonify({"error": "Usuário não encontrado"}), 404
            raise ValueError("Usuário não encontrado")
        
        # Verificar se a password está correta 
        if password != found_user_result[1]:
            # return jsonify({"error": "Senha incorreta"}), 401
            raise ValueError("Senha incorreta")
        
        token = jwt.encode({
            "User": found_user_result[0],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')

        return token 
    
    finally:
        connection.close()   

def register_user_logic(user, password):
    connection = create_connection()
    if not connection:
        # return jsonify({"error": "Não foi possível conectar com o banco"}), 500
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users WHERE user = ?", (user,))
        if cursor.fetchone():
            raise Exception("Usuário já está cadastrado no sistema")
        
        hashed_password = generate_password_hash(password)

        cursor.execute("INSERT INTO users (user, password) VALUES (?, ?)", (user, hashed_password))
        connection.commit()

        return {"message": "Usuário criado com sucesso!"}

    finally:    
        connection.close()

def list_all_users_logic():
    connection = create_connection()
    if not connection:
        # return jsonify({"error": "Não foi possível conectar com o banco"}), 500
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users")
        all_users = cursor.fetchall()

        if not all_users:
            raise Exception("Nenhum usuário encontrado no sistema.")
        
        users = []
        for user in all_users:
            users.append({
                "user": user[0],
                "id": user[2]
            })

        return {
            "message": f"Usuários listados com sucesso!",
            "Count": len(users),
            "users": users
                }
    
    finally:
        connection.close()

def update_user_data_logic(user_id, new_user=None, new_password=None):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        found_user = cursor.fetchone()

        if not found_user:
            raise Exception(f"Usuário com id {user_id} não encontrado")
        
        if new_user:
            cursor.execute("UPDATE users SET user = ? WHERE id = ?", (new_user, user_id))
            
        if new_password:
            hashed_password = generate_password_hash(new_password)
            cursor.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, user_id))

        connection.commit()
        return {"message": "Usuário atualizado com sucesso"}
    
    finally:
        connection.close()

def delete_user_logic(user_id):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        found_user = cursor.fetchone()

        if not found_user:
            raise Exception (f"Usuário com id {user_id} não encontrado")
        
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        connection.commit()

        return {"message": "Usuário deletado com sucesso!"}
    
    finally:
        connection.close()
