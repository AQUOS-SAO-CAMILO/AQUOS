from backend.src.config.connection import create_connection


def get_last_session_with_result(user_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT ts.session_start, sr.fluid_balance_ml
        FROM training_sessions ts
        JOIN athlete_profiles ap ON ts.athlete_id = ap.id
        JOIN session_results sr ON sr.session_id = ts.id
        WHERE ap.user_id = %s
        ORDER BY ts.session_start DESC
        LIMIT 1
    """, (user_id,))
    result = cursor.fetchone()
    connection.close()
    return result


def get_athlete_sessions_with_results(user_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("""
        SELECT
            ts.id, ts.modality, ts.intensity, ts.session_start, ts.session_end,
            ts.temperature_c, ts.humidity_pct, ts.pre_weight_kg, ts.post_weight_kg,
            ts.urine_volume_ml,
            sr.sweat_rate_lph, sr.fluid_balance_ml, sr.weight_loss_pct,
            sr.total_intake_ml, sr.adjusted_weight_loss_kg
        FROM training_sessions ts
        JOIN athlete_profiles ap ON ts.athlete_id = ap.id
        JOIN session_results sr ON sr.session_id = ts.id
        WHERE ap.user_id = %s
        ORDER BY ts.session_start ASC
    """, (user_id,))
    columns = [desc[0] for desc in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]
    connection.close()
    return results
