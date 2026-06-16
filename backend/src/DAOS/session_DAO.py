from backend.src.config.connection import create_connection
from backend.src.logger import logging

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

def update_training_session(athlete_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""UPDATE training_sessions
                   SET modality = %s, intensity = %s, session_start = %s, urine_color_pre = %s, 
                   bladder_emptied = %s, clothing_soaked = %s, urine_volume_ml = %s, notes = %s 
                   WHERE athlete_id = %s""", (modality, intensity, session_start, 
                                   urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes, athlete_id))
    connection.commit()
    connection.close()
    return {
            "Update": True,
            "session_id": athlete_id    
                }
    
def create_training_session(athlete_profile_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
            INSERT INTO training_sessions 
            (athlete_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) 
            RETURNING id
        """, (athlete_profile_id, modality, intensity, session_start, urine_color_pre, bladder_emptied, clothing_soaked, urine_volume_ml, notes))
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

def update_mass_value(pre_weight_kg, post_weight_kg, session_id, urine_volume_ml=None):
    connection = create_connection()
    cursor = connection.cursor()
    if urine_volume_ml is not None:
        cursor.execute("""UPDATE training_sessions
                          SET pre_weight_kg = %s, post_weight_kg = %s, urine_volume_ml = %s
                          WHERE id = %s""", (pre_weight_kg, post_weight_kg, urine_volume_ml, session_id))
    else:
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
                           weight_loss_pct = %s, sweat_rate_lph = %s, fluid_balance_ml = %s, dehydration_risk = %s,
                           target_intake_min_mlh = %s, target_intake_max_mlh = %s, interval_minutes = %s, 
                           alert_dehydration = %s, alert_overhydration = %s, notes = %s, calculated_at = %s   
                           WHERE session_id = %s""", (metrics['total_intake_ml'], metrics['adjusted_weight_loss_kg'], 
                                                      metrics['weight_loss_pct'], metrics['sweat_rate_lph'], 
                                                      metrics['fluid_balance_ml'], metrics['dehydration_risk'], metrics['target_intake_min_mlh'],
                                                      metrics['target_intake_max_mlh'], metrics['interval_minutes'],
                                                      metrics['alert_dehydration'], metrics['alert_overhydration'],
                                                      metrics['notes'], metrics['calculated_at'], session_id))
    connection.commit()
    connection.close()
    return {
            "Update": True,
            "session_id": session_id    
                }

def insert_session_result(metrics, session_id, ):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""INSERT INTO session_results 
                            (session_id, total_intake_ml, adjusted_weight_loss_kg, 
                            weight_loss_pct, sweat_rate_lph, fluid_balance_ml, dehydration_risk, 
                            target_intake_min_mlh, target_intake_max_mlh,
                            interval_minutes, alert_dehydration, alert_overhydration, notes, calculated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, 
                            %s, %s, %s, %s, %s, %s, %s)""", (session_id, metrics['total_intake_ml'], 
                            metrics['adjusted_weight_loss_kg'],
                            metrics['weight_loss_pct'], metrics['sweat_rate_lph'], metrics['fluid_balance_ml'], 
                            metrics['dehydration_risk'], metrics['target_intake_min_mlh'], metrics['target_intake_max_mlh'], 
                            metrics['interval_minutes'], metrics['alert_dehydration'], metrics['alert_overhydration'],
                            metrics['notes'], metrics['calculated_at']))
    connection.commit()
    connection.close()
    return {
        "Insert": True,
        "session_id": session_id
    }

def select_session_data(session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT ts.id, ts.pre_weight_kg, ts.post_weight_kg, ts.session_start, ts.session_end,
               ts.temperature_c, ts.humidity_pct, ts.urine_volume_ml,
               COALESCE(SUM(fi.volume_ml), 0) AS total_intake_ml
        FROM training_sessions ts
        LEFT JOIN fluid_intake_logs fi ON fi.session_id = ts.id
        WHERE ts.id = %s
        GROUP BY ts.id, ts.pre_weight_kg, ts.post_weight_kg, ts.session_start, ts.session_end,
                 ts.temperature_c, ts.humidity_pct, ts.urine_volume_ml
    """, (session_id,))
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

def get_session_result(session_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM session_results WHERE id = %s", (session_id,))
    result = cursor.fetchone()
    connection.close()
    return result

def get_all_modalities():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT DISTINCT modality
        FROM training_sessions
        WHERE modality IS NOT NULL
        ORDER BY modality ASC
    """)
    results = [{"id": row[0], "nome": row[0]} for row in cursor.fetchall()]
    connection.close()
    return results


def get_all_athletes():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT u.id, u.name
        FROM users u
        INNER JOIN athlete_profiles ap ON ap.user_id = u.id
        ORDER BY u.name ASC
    """)
    results = [{"id": str(row[0]), "nome": row[1]} for row in cursor.fetchall()]
    connection.close()
    return results


def get_all_teams():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT id, name FROM teams ORDER BY name ASC")
    results = [{"id": str(row[0]), "nome": row[1]} for row in cursor.fetchall()]
    connection.close()
    return results


def get_session_by_filters(modality=None, intensity=None, athlete_id=None,
                               team_id=None, session_start=None, session_end=None):
    try:
        connection = create_connection()
        cursor = connection.cursor()

        query = """
            SELECT ts.*
            FROM training_sessions ts
            INNER JOIN athlete_profiles ap ON ap.id = ts.athlete_id
            INNER JOIN users u ON u.id = ap.user_id
            WHERE 1=1
        """
        parameters = []

        if modality:
            query += " AND ts.modality = %s"
            parameters.append(modality)
        if intensity:
            query += " AND ts.intensity = %s"
            parameters.append(intensity)
        if athlete_id:
            query += " AND ap.user_id = %s"
            parameters.append(athlete_id)
        if team_id:
            query += """
                AND ap.user_id IN (
                    SELECT tu.user_id FROM teams_users tu WHERE tu.team_id = %s
                )
            """
            parameters.append(team_id)
        if session_start and str(session_start).strip() != "":
            query += " AND ts.session_start >= %s"
            parameters.append(f"{session_start} 00:00:00-03")
        if session_end and str(session_end).strip() != "":
            query += " AND ts.session_start <= %s"
            parameters.append(f"{session_end} 23:59:59-03")

        query += " ORDER BY ts.session_start DESC"

        cursor.execute(query, tuple(parameters))
        raw_result = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in raw_result]
        return results

    except Exception as e:
        raise e
    finally:
        connection.close()

def select_all_teams():

    connection = None
    cursor = None

    try:
        connection = create_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM teams")

        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return results
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


    