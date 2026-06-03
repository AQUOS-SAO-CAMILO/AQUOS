from flask import Blueprint, jsonify
from backend.src.services.report_service import build_athlete_report, get_last_session_summary
import logging

log = logging.getLogger("meuapp")

report = Blueprint("report", __name__)


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


@report.route("/report/atleta/<atleta_id>", methods=["GET"])
def athlete_report(atleta_id):
    log.debug("Requisição de relatório do atleta recebida. atleta_id=%s", atleta_id)

    if not atleta_id:
        return jsonify({"error": "Id do atleta é obrigatório."}), 400

    try:
        data = build_athlete_report(atleta_id)
        log.info("Relatório do atleta gerado com sucesso. atleta_id=%s", atleta_id)
        return jsonify(data), 200

    except Exception as e:
        log.error("Erro ao gerar relatório do atleta. atleta_id=%s | Erro: %s", atleta_id, e)
        return jsonify({"error": f"Erro ao gerar relatório. {e}"}), 500
