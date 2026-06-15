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

def get_sessions_by_filters_with_results(modality=None, team_id=None, athlete_id=None,
                                          session_start=None, session_end=None):
    connection = create_connection()
    try:
        cursor = connection.cursor()

        query = """
            SELECT
                ts.id,
                ts.modality,
                ts.intensity,
                ts.session_start,
                ts.session_end,
                ts.temperature_c,
                ts.humidity_pct,
                sr.sweat_rate_lph,
                sr.fluid_balance_ml,
                sr.weight_loss_pct,
                sr.dehydration_risk,
                u.name        AS athlete_name,
                ap.user_id    AS athlete_id,
                t.name        AS team_name
            FROM training_sessions ts
            INNER JOIN athlete_profiles ap ON ap.id = ts.athlete_id
            INNER JOIN users u             ON u.id  = ap.user_id
            LEFT  JOIN session_results sr  ON sr.session_id = ts.id
            LEFT  JOIN teams_users tu      ON tu.user_id = ap.user_id
            LEFT  JOIN teams t             ON t.id = tu.team_id
            WHERE sr.id IS NOT NULL
        """
        params = []

        if modality:
            query += " AND ts.modality = %s"
            params.append(modality)
        if athlete_id:
            query += " AND ap.user_id = %s"
            params.append(athlete_id)
        if team_id:
            query += " AND t.id = %s"
            params.append(team_id)
        if session_start and str(session_start).strip():
            query += " AND ts.session_start >= %s"
            params.append(f"{session_start} 00:00:00-03")
        if session_end and str(session_end).strip():
            query += " AND ts.session_start <= %s"
            params.append(f"{session_end} 23:59:59-03")

        query += " ORDER BY ts.session_start ASC"

        cursor.execute(query, tuple(params))
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

    except Exception as e:
        raise e
    finally:
        connection.close()
