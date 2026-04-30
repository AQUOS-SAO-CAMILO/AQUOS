from backend.src.config.connection import create_connection

def create_session_logic(athlete_id, modality, session_start, bladder_emptied, clothing_soaked):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()

        cursor.execute("SELECT id FROM athlete_profiles WHERE user_id = %s", (athlete_id,))
        profile = cursor.fetchone()

        if profile:
            athlete_profile_id = profile[0]
        else:
            cursor.execute("SELECT id FROM athlete_profiles WHERE id = %s", (athlete_id,))
            profile_exists = cursor.fetchone()

            if profile_exists:
                athlete_profile_id = athlete_id
            else:
                athlete_code = f"ATH_{str(athlete_id)[:8].upper()}"
                cursor.execute("""
                        INSERT INTO athlete_profiles (id, user_id, athlete_code) 
                        VALUES (gen_random_uuid(), %s, %s) 
                        RETURNING id
                    """, (athlete_id, athlete_code))
                athlete_profile_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO training_sessions 
            (athlete_id, modality, session_start, bladder_emptied, clothing_soaked) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id
        """, (athlete_profile_id, modality, session_start, bladder_emptied, clothing_soaked))

        session_id = cursor.fetchone()[0]

        connection.commit()
        
        return {
            "message": "Sessão criada com sucesso!",
            "session_id": session_id
        }
    
    finally:
        connection.close()

def register_mass_logic(pre_weight_kg, pos_weight_kg, session_id):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        
        cursor.execute("SELECT id FROM training_sessions WHERE id = %s", (session_id,))
        session = cursor.fetchone()

        if not session:
            raise Exception("Sessão de treino não encontrada.")

        weight_loss_pct = ((pos_weight_kg - pre_weight_kg)/pre_weight_kg) * 100

        cursor.execute("""UPDATE training_sessions 
                        SET pre_weight_kg = %s, post_weight_kg = %s, weight_loss_pct = %s 
                        WHERE id = %s""",     
                        (pre_weight_kg, pos_weight_kg, weight_loss_pct, session_id))

        connection.commit() 

        return {
            "message": "Percentual de variação de massa adicionado com sucesso no banco de dados!",
            "session_id": session_id,
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
        cursor.execute("SELECT * FROM training_sessions WHERE session_id = %s", (session_id,))
        if not cursor.fetchone():
            raise Exception("Sessão de treino não encontrada")
        
        cursor.execute("""UPDATE training_sessions 
                       SET temperature_c = %s, humidity_pct = %s 
                       WHERE id = %s""", 
                       (temperature_c, humidity_pct, session_id))
        connection.commit()

        return{
            "message": "temperatura e umidade adicionados com sucesso ao banco de dados!",
            "temperature_c": temperature_c,
            "umidade": humidity_pct,
            "session_id": session_id
        }

    finally:
        connection.close()