from backend.src.config.connection import create_connection
from datetime import datetime

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

def register_mass_logic(pre_weight_kg, post_weight_kg, session_id):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM training_sessions WHERE id = %s", (session_id,))
        session = cursor.fetchone()

        if not session:
            raise Exception("Sessão de treino não encontrada para este usuário")
        
        weight_loss_pct = ((post_weight_kg - pre_weight_kg)/pre_weight_kg) * 100

        cursor.execute("""UPDATE training_sessions     
                      SET pre_weight_kg = %s, post_weight_kg = %s 
                      WHERE id = %s""", (pre_weight_kg, post_weight_kg, session_id))
        connection.commit() 

        return {
            "message": "Percentual de variação de massa adicionado com sucesso no banco de dados!",
            "Diferenca_kg": round(weight_loss_pct, 2)    
                }
    
    finally:
        connection.close()

def calculate_session_metrics(session_data):
    pre_weight = float(session_data['pre_weight_kg'])
    pos_weight = float(session_data['post_weight_kg'])
    total_intake_ml = float(session_data.get('total_intake_ml', 0))    
    urine_volume_ml = float(session_data.get('urine_volume_ml', 0))
    duration_hours = float(session_data.get('duration_hours', 1))

    # Perda de massa ajustada
    mass_loss_kg = pre_weight - pos_weight
    adjusted_weight_loss_kg = mass_loss_kg + (total_intake_ml / 1000) - (urine_volume_ml / 1000)
    
    # Percentual de variação
    weight_loss_pct = (mass_loss_kg / pre_weight) * 100 if pre_weight > 0 else 0
    
    # Taxa de sudorese (L/h)
    sweat_rate_lph = adjusted_weight_loss_kg / duration_hours if duration_hours > 0 else 0
    
    # Balanço hídrico (mL)
    fluid_balance_ml = total_intake_ml - (adjusted_weight_loss_kg * 1000) 

    return {
        "session_id": session_data['id'],
        "total_intake_ml": total_intake_ml,
        "adjusted_weight_loss_kg": round(adjusted_weight_loss_kg, 2),
        "weight_loss_pct": round(weight_loss_pct, 2),
        "sweat_rate_lph": round(sweat_rate_lph, 2),
        "fluid_balance_ml": round(fluid_balance_ml, 2)
    }

def save_session_result(session_id, metrics):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")

    try:
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM session_results WHERE session_id = %s", (session_id,))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("""UPDATE session_results
                           SET total_intake_ml = %s, adjusted_weight_loss_kg = %s,
                           weight_loss_pct = %s, sweat_rate_lph = %s, fluid_balance_ml = %s 
                           WHERE session_id = %s""", (metrics['total_intake_ml'], metrics['adjusted_weight_loss_kg'], 
                                                      metrics['weight_loss_pct'], metrics['sweat_rate_lph'], 
                                                      metrics['fluid_balance_ml'], session_id))
        else:
            cursor.execute("""INSERT INTO session_results 
                            (session_id, total_intake_ml, adjusted_weight_loss_kg, 
                            weight_loss_pct, sweat_rate_lph, fluid_balance_ml)
                            VALUES (%s, %s, %s, %s, %s, %s)""", (session_id, metrics['total_intake_ml'], 
                                                                 metrics['adjusted_weight_loss_kg'],
                                                                 metrics['weight_loss_pct'], metrics['sweat_rate_lph'], 
                                                                 metrics['fluid_balance_ml']))

        connection.commit()

    finally:
        connection.close()

def get_session_data(session_id):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("""SELECT id, pre_weight_kg, post_weight_kg, session_start, session_end, 
                       temperature_c, humidity_pct
                       FROM training_sessions
                       WHERE id = %s""", (session_id,))
        
        session = cursor.fetchone()
        if not session:
            raise Exception(f"Impossível buscar dados do usuário no momento. Sessão com id {session_id} não encontrada.")
        
        session_data = {
            "id": session[0],
            "pre_weight_kg": session[1],
            "post_weight_kg": session[2],
            "session_start": session[3],
            "session_end": session[4],
            "temperature_c": session[5],
            "humidity_pct": session[6],
        }

        if session[4] and session[3]:
            duration_session = (session[4] - session[3]).total_seconds() / 3600
            session_data["duration_hours"] = round(duration_session, 2)
        
        return session_data
    
    finally:
        connection.close()

def register_environment_logic(temperature_c, humidity_pct, session_id):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM training_sessions WHERE id = %s", (session_id,))
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

def register_hydration_logic(session_id, volume_ml, fluid_type='water', logged_at=None):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco no momento")
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM training_sessions WHERE id = %s", (session_id,))
        if not cursor.fetchone():
            raise Exception("Sessão não encontrada")
        
        if not logged_at:
            logged_at = datetime.now()

        cursor.execute("""INSERT INTO fluid_intake_logs (session_id, volume_ml, fluid_type, logged_at) 
                      VALUES (%s, %s, %s, %s)""", 
                      (session_id, volume_ml, fluid_type, logged_at))
        
        connection.commit()

        return {
            "message": "Ingestão registrada com sucesso",
            "session_id": session_id,
            "volume_ml": volume_ml,
            "fluid_type": fluid_type,
            "logged_at": logged_at
        }

    finally:
        connection.close()

def session_end_logic(session_id, session_end):
    connection = create_connection()
    if not connection:
        raise Exception("Não foi possível conectar com o banco de dados no momento.")

    try:
        cursor = connection.cursor()
        cursor.execute("SELECT  id, session_start FROM training_sessions WHERE id = %s", (session_id,))
        
        result = cursor.fetchone()
        if not result:
            raise Exception("Sessão não encontrada")
        
        session_start = result[1]

        if session_start.tzinfo is not None:
            session_start = session_start.replace(tzinfo=None)
        if session_end.tzinfo is not None:
            session_end = session_end.replace(tzinfo=None)

        duration_hours = None
        if session_start and session_end:
            duration = (session_end - session_start).total_seconds() / 3600
            duration_hours = round(duration, 2)

        cursor.execute("""UPDATE training_sessions 
                       SET session_end = %s 
                       WHERE id = %s""", (session_end, session_id))
        connection.commit()

        return {
            "message": "Sessão finalizada com sucesso!",
            "session_id": session_id,
            "session_end": session_end,             
            "duration_hours": duration_hours
        }
    
    finally:
        connection.close()

