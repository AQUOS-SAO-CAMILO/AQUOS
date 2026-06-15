import statistics
import logging
from collections import defaultdict
from backend.src.DAOS.report_DAO import get_athlete_sessions_with_results, get_last_session_with_result, get_sessions_by_filters_with_results

log = logging.getLogger("meuapp")


def get_last_session_summary(user_id):
    result = get_last_session_with_result(user_id)
    if not result:
        return None
    session_start, fluid_balance_ml = result
    return {
        "data": session_start.strftime("%d/%m") if session_start else "--/--",
        "balancoHidrico": round(float(fluid_balance_ml), 2) if fluid_balance_ml is not None else None,
    }


def _classify_climate(temp):
    if temp is None:
        return "NÃO INFORMADO"
    if temp >= 30:
        return "QUENTE"
    elif temp >= 20:
        return "MODERADO"
    return "FRIO"


def build_athlete_report(user_id):
    sessions = get_athlete_sessions_with_results(user_id)
    log.debug("Sessões encontradas para atleta %s: %d", user_id, len(sessions))

    if not sessions:
        return {
            "geral": {
                "average": "0.00 L/h",
                "median": "0.00 L/h",
                "stdDeviation": "0.00 L/h",
                "totalSessoes": 0,
            },
            "grafico": [],
            "modalidades": [],
            "equipes": [],
            "climas": [],
        }

    sweat_rates = [float(s["sweat_rate_lph"] or 0) for s in sessions]
    avg = statistics.mean(sweat_rates)
    median = statistics.median(sweat_rates)
    std_dev = statistics.stdev(sweat_rates) if len(sweat_rates) > 1 else 0.0
    global_min = min(sweat_rates)
    global_max = max(sweat_rates)

    grafico = []
    for i, s in enumerate(sessions):
        rates_so_far = sweat_rates[: i + 1]
        grafico.append({
            "sessao": f"S{i + 1}",
            "media": round(statistics.mean(rates_so_far), 2),
            "mediana": round(statistics.median(rates_so_far), 2),
            "limite": [round(global_min, 2), round(global_max, 2)],
        })

    modal_groups = defaultdict(list)
    for s in sessions:
        modal_groups[s["modality"]].append(s)

    modalidades = []
    for nome, group in modal_groups.items():
        sr = [float(x["sweat_rate_lph"] or 0) for x in group]
        fb = [float(x["fluid_balance_ml"] or 0) for x in group]
        wl = [float(x["weight_loss_pct"] or 0) for x in group]

        durations = []
        for x in group:
            if x["session_start"] and x["session_end"]:
                dur = (x["session_end"] - x["session_start"]).total_seconds() / 3600
                durations.append(dur)

        avg_dur = statistics.mean(durations) if durations else 0
        intensities = [x["intensity"] for x in group]
        most_common_intensity = max(set(intensities), key=intensities.count)

        modalidades.append({
            "nome": nome,
            "sessoes": len(group),
            "duracao": f"{avg_dur:.1f}h",
            "intensidade": most_common_intensity,
            "balancoHidrico": f"{statistics.mean(fb):.0f} ml",
            "taxaSudorese": f"{statistics.mean(sr):.2f} L/h",
            "variacaoMassa": f"{statistics.mean(wl):.1f}%",
        })

    clima_groups = defaultdict(list)
    for s in sessions:
        clima_groups[_classify_climate(s["temperature_c"])].append(s)

    climas = []
    for nome, group in clima_groups.items():
        sr = [float(x["sweat_rate_lph"] or 0) for x in group]
        fb = [float(x["fluid_balance_ml"] or 0) for x in group]
        wl = [float(x["weight_loss_pct"] or 0) for x in group]
        temps = [float(x["temperature_c"]) for x in group if x["temperature_c"] is not None]
        humids = [float(x["humidity_pct"]) for x in group if x["humidity_pct"] is not None]

        climas.append({
            "nome": nome,
            "sessoes": len(group),
            "tempMedia": f"{statistics.mean(temps):.1f}°C" if temps else "-",
            "umidade": f"{statistics.mean(humids):.0f}%" if humids else "-",
            "balancoHidrico": f"{statistics.mean(fb):.0f} ml",
            "taxaSudorese": f"{statistics.mean(sr):.2f} L/h",
            "variacaoMassa": f"{statistics.mean(wl):.1f}%",
        })

    return {
        "geral": {
            "average": f"{avg:.2f} L/h",
            "median": f"{median:.2f} L/h",
            "stdDeviation": f"{std_dev:.2f} L/h",
            "totalSessoes": len(sessions),
        },
        "grafico": grafico,
        "modalidades": modalidades,
        "equipes": [],
        "climas": climas,
    }

def build_adm_report(modality=None, team_id=None, athlete_id=None,
                     session_start=None, session_end=None):
    sessions = get_sessions_by_filters_with_results(
        modality=modality,
        team_id=team_id,
        athlete_id=athlete_id,
        session_start=session_start,
        session_end=session_end,
    )

    log.debug("Sessões para relatório adm: %d", len(sessions))

    if not sessions:
        return {
            "geral": {
                "average": "0.00 L/h",
                "median": "0.00 L/h",
                "stdDeviation": "0.00 L/h",
                "totalSessoes": 0,
            },
            "grafico": [],
            "modalidades": [],
            "equipes": [],
            "atletas": [],
            "climas": [],
        }

    sweat_rates = [float(s["sweat_rate_lph"] or 0) for s in sessions]
    avg     = statistics.mean(sweat_rates)
    median  = statistics.median(sweat_rates)
    std_dev = statistics.stdev(sweat_rates) if len(sweat_rates) > 1 else 0.0
    global_min = min(sweat_rates)
    global_max = max(sweat_rates)

    grafico = []
    for i, s in enumerate(sessions):
        rates_so_far = sweat_rates[: i + 1]
        grafico.append({
            "sessao":  f"S{i + 1}",
            "media":   round(statistics.mean(rates_so_far), 2),
            "mediana": round(statistics.median(rates_so_far), 2),
            "limite":  [round(global_min, 2), round(global_max, 2)],
        })

    modal_groups = defaultdict(list)
    for s in sessions:
        modal_groups[s["modality"]].append(s)

    modalidades = []
    for nome, group in modal_groups.items():
        sr  = [float(x["sweat_rate_lph"]   or 0) for x in group]
        fb  = [float(x["fluid_balance_ml"] or 0) for x in group]
        wl  = [float(x["weight_loss_pct"]  or 0) for x in group]
        durations = []
        for x in group:
            if x["session_start"] and x["session_end"]:
                durations.append((x["session_end"] - x["session_start"]).total_seconds() / 3600)
        avg_dur = statistics.mean(durations) if durations else 0
        intensities = [x["intensity"] for x in group if x["intensity"]]
        most_common = max(set(intensities), key=intensities.count) if intensities else "-"
        modalidades.append({
            "nome":          nome,
            "sessoes":       len(group),
            "duracao":       f"{avg_dur:.1f}h",
            "intensidade":   most_common,
            "balancoHidrico": f"{statistics.mean(fb):.0f} ml",
            "taxaSudorese":  f"{statistics.mean(sr):.2f} L/h",
            "variacaoMassa": f"{statistics.mean(wl):.1f}%",
        })

    equipe_groups = defaultdict(list)
    for s in sessions:
        key = s.get("team_name") or "SEM EQUIPE"
        equipe_groups[key].append(s)

    equipes = []
    for nome, group in equipe_groups.items():
        sr = [float(x["sweat_rate_lph"]   or 0) for x in group]
        fb = [float(x["fluid_balance_ml"] or 0) for x in group]
        wl = [float(x["weight_loss_pct"]  or 0) for x in group]
        equipes.append({
            "nome":          nome,
            "sessoes":       len(group),
            "balancoHidrico": f"{statistics.mean(fb):.0f} ml",
            "taxaSudorese":  f"{statistics.mean(sr):.2f} L/h",
            "variacaoMassa": f"{statistics.mean(wl):.1f}%",
        })

    atleta_groups = defaultdict(list)
    for s in sessions:
        key = s.get("athlete_name") or s.get("athlete_id") or "DESCONHECIDO"
        atleta_groups[key].append(s)

    atletas = []
    for nome, group in atleta_groups.items():
        sr = [float(x["sweat_rate_lph"]   or 0) for x in group]
        fb = [float(x["fluid_balance_ml"] or 0) for x in group]
        wl = [float(x["weight_loss_pct"]  or 0) for x in group]
        sample = group[0]
        atletas.append({
            "nome":          nome,
            "sessoes":       len(group),
            "modalidade":    sample.get("modality") or "-",
            "equipe":        sample.get("team_name") or "-",
            "balancoHidrico": f"{statistics.mean(fb):.0f} ml",
            "taxaSudorese":  f"{statistics.mean(sr):.2f} L/h",
            "variacaoMassa": f"{statistics.mean(wl):.1f}%",
        })

    clima_groups = defaultdict(list)
    for s in sessions:
        clima_groups[_classify_climate(s.get("temperature_c"))].append(s)

    climas = []
    for nome, group in clima_groups.items():
        sr    = [float(x["sweat_rate_lph"]   or 0) for x in group]
        fb    = [float(x["fluid_balance_ml"] or 0) for x in group]
        wl    = [float(x["weight_loss_pct"]  or 0) for x in group]
        temps  = [float(x["temperature_c"]) for x in group if x.get("temperature_c") is not None]
        humids = [float(x["humidity_pct"])  for x in group if x.get("humidity_pct")  is not None]
        climas.append({
            "nome":          nome,
            "sessoes":       len(group),
            "tempMedia":     f"{statistics.mean(temps):.1f}°C" if temps else "-",
            "umidade":       f"{statistics.mean(humids):.0f}%" if humids else "-",
            "balancoHidrico": f"{statistics.mean(fb):.0f} ml",
            "taxaSudorese":  f"{statistics.mean(sr):.2f} L/h",
            "variacaoMassa": f"{statistics.mean(wl):.1f}%",
        })

    return {
        "geral": {
            "average":      f"{avg:.2f} L/h",
            "median":       f"{median:.2f} L/h",
            "stdDeviation": f"{std_dev:.2f} L/h",
            "totalSessoes": len(sessions),
        },
        "grafico":     grafico,
        "modalidades": modalidades,
        "equipes":     equipes,
        "atletas":     atletas,
        "climas":      climas,
    }