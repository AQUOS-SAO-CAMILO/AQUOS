from backend.src.config.connection import create_connection

def get_athlete_profile_by_id(athlete_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id FROM athlete_profiles WHERE id = %s", (athlete_id, ))
    result = cursor.fetchone()
    connection.close()
    return result

def get_athlete_profile_by_user_id(athlete_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id FROM athlete_profiles WHERE user_id = %s", (athlete_id, ))
    result = cursor.fetchone()
    connection.close()
    return result

def create_athlete_profile(athlete_id, athlete_code):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
                        INSERT INTO athlete_profiles (id, user_id, athlete_code) 
                        VALUES (gen_random_uuid(), %s, %s) 
                        RETURNING id
                    """, (athlete_id, athlete_code))
    result = cursor.fetchone()[0]
    connection.commit()
    connection.close()
    return result
    
def create_training_session(athlete_profile_id, modality, session_start, bladder_emptied, clothing_soaked):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
            INSERT INTO training_sessions 
            (athlete_id, modality, session_start, bladder_emptied, clothing_soaked) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id
        """, (athlete_profile_id, modality, session_start, bladder_emptied, clothing_soaked))
    result = cursor.fetchone()[0]
    connection.commit()
    connection.close()
    return result

def select_all_data(session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM training_sessions WHERE id = %s", (session_id,))
    result = cursor.fetchone()
    connection.close()
    return result

def update_mass_value(pre_weight_kg, post_weight_kg, session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""UPDATE training_sessions     
                      SET pre_weight_kg = %s, post_weight_kg = %s 
                      WHERE id = %s""", (pre_weight_kg, post_weight_kg, session_id))
    connection.commit()
    connection.close()
    return {
            "Update": True,
            "session_id": session_id    
                }

def get_id_by_session_id(session_id): 
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id FROM session_results WHERE session_id = %s", (session_id,))
    result = cursor.fetchone()
    connection.close()
    return result

def update_session_result(metrics, session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""UPDATE session_results
                           SET total_intake_ml = %s, adjusted_weight_loss_kg = %s,
                           weight_loss_pct = %s, sweat_rate_lph = %s, fluid_balance_ml = %s 
                           WHERE session_id = %s""", (metrics['total_intake_ml'], metrics['adjusted_weight_loss_kg'], 
                                                      metrics['weight_loss_pct'], metrics['sweat_rate_lph'], 
                                                      metrics['fluid_balance_ml'], session_id))
    connection.commit()
    connection.close()
    return {
            "Update": True,
            "session_id": session_id    
                }

def insert_session_result(metrics, session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""INSERT INTO session_results 
                            (session_id, total_intake_ml, adjusted_weight_loss_kg, 
                            weight_loss_pct, sweat_rate_lph, fluid_balance_ml)
                            VALUES (%s, %s, %s, %s, %s, %s)""", (session_id, metrics['total_intake_ml'], 
                                                                 metrics['adjusted_weight_loss_kg'],
                                                                 metrics['weight_loss_pct'], metrics['sweat_rate_lph'], 
                                                                 metrics['fluid_balance_ml']))
    connection.commit()
    connection.close()
    return {
        "Insert": True,
        "session_id": session_id
    }

def select_session_data(session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""SELECT id, pre_weight_kg, post_weight_kg, session_start, session_end, 
                       temperature_c, humidity_pct
                       FROM training_sessions
                       WHERE id = %s""", (session_id,))
    result = cursor.fetchone()
    connection.close()
    return result

def update_environment_data(temperature_c, humidity_pct, session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""UPDATE training_sessions 
                       SET temperature_c = %s, humidity_pct = %s 
                       WHERE id = %s""", 
                       (temperature_c, humidity_pct, session_id))
    connection.commit()
    connection.close()
    return {
        "Update": True,
        "session_id": session_id,
    }

def get_hydration_id_by_session_id(session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id FROM training_sessions WHERE id = %s", (session_id,))
    result = cursor.fetchone()
    connection.close()
    return result

def insert_hydration_data(session_id, volume_ml, fluid_type='water', logged_at=None):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""INSERT INTO fluid_intake_logs (session_id, volume_ml, fluid_type, logged_at) 
                      VALUES (%s, %s, %s, %s)""", 
                      (session_id, volume_ml, fluid_type, logged_at))
    connection.commit()
    connection.close()
    return {
        "Insert": True,
        "session_id": session_id
    }

def get_specific_data_end(session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id, session_start FROM training_sessions WHERE id = %s", (session_id,))
    result = cursor.fetchone()
    connection.close()
    return result

def update_data_end(session_id, session_end):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""UPDATE training_sessions 
                       SET session_end = %s 
                       WHERE id = %s""", (session_end, session_id))
    connection.commit()
    connection.close()
    return {
        "Update": True,
        "session_id": session_id
    }