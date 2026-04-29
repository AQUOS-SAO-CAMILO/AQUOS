from backend.src.config.database import create_connection

def register_mass_logic(pre_weight_kg, pos_weight_kg, user_id):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM training_sessions WHERE session_id = ?", (user_id,))
        session = cursor.fetchone()

        if not session:
            raise Exception("Sessão de treino não encontrada para este usuário")
        
        weight_loss_pct = ((pos_weight_kg - pre_weight_kg)/pre_weight_kg) * 100

        cursor.execute("UPDATE training_sessions SET (session_id, weight_loss_pct) VALUES (?, ?)", (session, weight_loss_pct))
        connection.commit() 

        return {
            "message": "Percentual de variação de massa adicionado com sucesso no banco de dados!",
            "Diferenca_kg": round(weight_loss_pct, 2)    
                }
    
    finally:
        connection.close()

def register_environment_logic(temperature_c, humidity_pct, session_id):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM training_sessions WHERE session_id = ?", (session_id,))
        if not cursor.fetchone():
            raise Exception("Sessão de treino não encontrada")
        
        cursor.execute("UPDATE training_sessions SET (temperature_c, humidity_pct, session_id) VALUES (?, ?, ?)", (temperature_c, humidity_pct, session_id))
        connection.commit()

        return{
            "message": "temperatura e umidade adicionados com sucesso ao banco de dados!",
            "temperature_c": temperature_c,
            "umidade": humidity_pct
        }

    finally:
        connection.close()