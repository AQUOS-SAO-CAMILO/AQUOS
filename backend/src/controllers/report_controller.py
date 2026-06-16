import io, jwt
from flask import Blueprint, jsonify, send_file, request, current_app
from backend.src.services.report_service import build_athlete_report, get_last_session_summary, build_adm_report
from backend.src.utils.report_pdf import generate_hydration_pdf, generate_adm_report_pdf, generate_athlete_report_pdf
import logging


log = logging.getLogger("meuapp")

report = Blueprint("report", __name__)

def _get_user_id():
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    if not token:
        return None
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return payload.get("User_id")
    except Exception:
        return None

@report.route("/api/sessoes/ultima/<atleta_id>", methods=["GET"])
def last_session(atleta_id):
    log.debug("Requisição de última sessão recebida. atleta_id=%s", atleta_id)
    try:
        data = get_last_session_summary(atleta_id)
        if data is None:
            return jsonify({"data": "Inicie um treino!", "balancoHidrico": None}), 200
        log.info("Última sessão retornada com sucesso. atleta_id=%s", atleta_id)
        return jsonify(data), 200
    except Exception as e:
        log.error("Erro ao buscar última sessão. atleta_id=%s | Erro: %s", atleta_id, e)
        return jsonify({"error": f"Erro ao buscar última sessão. {e}"}), 500

@report.route("/report/athlete/export", methods=["GET"])
def athlete_report():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Id do atleta é obrigatório."}), 400
    
    athlete_id = request.args.get("atleta") or request.args.get("athlete")
    if not athlete_id:
        return jsonify({"error": "Athlete ID é necessário para exportação."}), 400
    
    try:
        log.debug("Gerando PDF report export para athlete_id=%s", athlete_id)
        data = build_athlete_report(athlete_id)

        pdf_bytes = generate_athlete_report_pdf(data) 
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name="athlete_athlete_report.pdf"
        )
    except Exception as e:
        return jsonify({"error": f"Erro ao gerar relatório. {e}"}), 500

@report.route("/report/athlete/<athlete_id>", methods=["GET"])
def get_athlete_report_data(athlete_id):
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized."}), 401
    
    log.debug("Obtendo dados de relatório analítico para athlete_id=%s", athlete_id)

    try:
        data = build_athlete_report(athlete_id)
        return jsonify(data), 200
    except Exception as e:
        log.error("Erro ao tentar gerar dados de relatório de atleta. Error: %s", e)
        return jsonify({"error": f"Error generating report data: {e}"}), 500
    
@report.route("/report/admin", methods=["GET"])
def get_adm_report_data():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized."}), 401
    
    modality = request.args.get("modality")
    team_id = request.args.get("team_id")
    athlete_id = request.args.get("athlete_id")
    session_start = request.args.get("session_start")
    session_end = request.args.get("session_end")

    try:
        data = build_adm_report(
            modality=modality,
            team_id=team_id,
            athlete_id=athlete_id,
            session_start=session_start,
            session_end=session_end,
        )
        return jsonify(data), 200
    except Exception as e:
        log.error("Error generating admin json data. Error: %s", e)
        return jsonify({"error": f"Error generating admin report data: {e}"}), 500

@report.route("/report/admin/export", methods=["GET"])
def adm_report():
    user_id = _get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized."}), 401
    
    modality = request.args.get("modality")
    team_id = request.args.get("team_id")
    athlete_id = request.args.get("athlete_id")
    session_start = request.args.get("session_start")
    session_end = request.args.get("session_end")

    log.debug(
        "Requisição de report admin recebida. modality=%s | team_id=%s | athlete_id=%s",
        modality, team_id, athlete_id
    )

    try:
        data = build_adm_report(
            modality=modality,
            team_id=team_id,
            athlete_id=athlete_id,
            session_start=session_start,
            session_end=session_end,
        )

        pdf_bytes = generate_adm_report_pdf(data) 
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name="admin_management_report.pdf"
        )
    
    except Exception as e:
        log.error("Error generating admin report. Error: %s", e)
        return jsonify({"error": f"Error generating admin report: {e}"}), 500