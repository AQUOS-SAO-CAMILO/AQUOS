from io import BytesIO

from reportlab.lib.pagesizes import A4
from session_DAO import get_session_result
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from dataclasses import dataclass
from typing import Optional

@dataclass
class HydrationSession:
    session_id: int
    total_intake_ml: float
    adjusted_weight_loss_kg: float
    weight_loss_pct: float
    sweat_rate_lph: float
    fluid_balance_ml: float
    dehydration_risk: str
    target_intake_min_mlh: float
    target_intake_max_mlh: float
    interval_minutes: int
    alert_dehydration: bool
    alert_overhydration: bool
    notes: Optional[str] = None
    calculated_at: Optional[str] = None

def create_session(session_id):
    result = session_DAO.get_session_result(session_id)

    if result is None:
        print('Session not found')
        return None

    return HydrationSession(
        session_id=result[1],
        total_intake_ml=result[2],
        adjusted_weight_loss_kg=result[3],
        weight_loss_pct=result[4],
        sweat_rate_lph=result[5],
        fluid_balance_ml=result[6],
        dehydration_risk=result[7],
        target_intake_min_mlh=result[8],
        target_intake_max_mlh=result[9],
        interval_minutes=result[10],
        alert_dehydration=result[11],
        alert_overhydration=result[12],
        notes=result[13],
        calculated_at=result[14],
    )


def _styles():
    return {
        "title": ParagraphStyle("title",
            fontName="Helvetica-Bold", fontSize=16,
            leading=20, spaceAfter=2),
        "meta": ParagraphStyle("meta",
            fontName="Helvetica", fontSize=9,
            textColor=colors.HexColor("#555555"), leading=13),
        "section": ParagraphStyle("section",
            fontName="Helvetica-Bold", fontSize=10,
            leading=14, spaceBefore=8, spaceAfter=2),
        "label": ParagraphStyle("label",
            fontName="Helvetica", fontSize=9,
            textColor=colors.HexColor("#444444"), leading=13),
        "value": ParagraphStyle("value",
            fontName="Helvetica-Bold", fontSize=9, leading=13),
        "note": ParagraphStyle("note",
            fontName="Helvetica-Oblique", fontSize=9, leading=13),
        "footer": ParagraphStyle("footer",
            fontName="Helvetica", fontSize=8,
            textColor=colors.HexColor("#888888"),
            alignment=TA_CENTER, leading=11),
    }


def _data_table(rows: list, st: dict) -> Table:
    table_data = [
        [Paragraph(label, st["label"]), Paragraph(value, st["value"])]
        for label, value in rows
    ]
    t = Table(table_data, colWidths=[80*mm, 90*mm])
    t.setStyle(TableStyle([
        ("LINEBELOW",     (0, 0), (-1, -1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t

def generate_hydration_pdf(data: HydrationSession) -> bytes:
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=18*mm,  bottomMargin=18*mm,
    )

    st = _styles()
    story = []

    def hr():
        return HRFlowable(width="100%", thickness=0.5,
                          color=colors.HexColor("#AAAAAA"), spaceAfter=4)

    # Header
    story.append(Paragraph("Hydration Session Report", st["title"]))
    story.append(hr())
    story.append(Paragraph(
        f"Session ID: {data.session_id} &nbsp; | &nbsp; Calculated at: {data.calculated_at or '—'}",
        st["meta"]))
    story.append(Spacer(1, 6*mm))

    # Fluid Measurements
    story.append(Paragraph("Fluid Measurements", st["section"]))
    story.append(hr())
    story.append(_data_table([
        ("Total Intake",         f"{data.total_intake_ml:,.2f} mL"),
        ("Fluid Balance",        f"{data.fluid_balance_ml:,.2f} mL"),
        ("Adjusted Weight Loss", f"{data.adjusted_weight_loss_kg:.3f} kg"),
        ("Weight Loss",          f"{data.weight_loss_pct:.2f} %"),
        ("Sweat Rate",           f"{data.sweat_rate_lph:.3f} L/h"),
    ], st))
    story.append(Spacer(1, 5*mm))

    # Risk Assessment
    story.append(Paragraph("Risk Assessment", st["section"]))
    story.append(hr())
    story.append(_data_table([
        ("Dehydration Risk", data.dehydration_risk.capitalize()),
    ], st))
    story.append(Spacer(1, 5*mm))

    # Intake Targets
    story.append(Paragraph("Intake Targets", st["section"]))
    story.append(hr())
    story.append(_data_table([
        ("Minimum Target", f"{data.target_intake_min_mlh:.1f} mL/h"),
        ("Maximum Target", f"{data.target_intake_max_mlh:.1f} mL/h"),
        ("Check Interval", f"Every {data.interval_minutes} min"),
    ], st))
    story.append(Spacer(1, 5*mm))

    # Alerts
    story.append(Paragraph("Alerts", st["section"]))
    story.append(hr())
    story.append(_data_table([
        ("Dehydration Alert",   "Yes" if data.alert_dehydration  else "No"),
        ("Overhydration Alert", "Yes" if data.alert_overhydration else "No"),
    ], st))
    story.append(Spacer(1, 5*mm))

    # Notes
    if data.notes:
        story.append(Paragraph("Notes", st["section"]))
        story.append(hr())
        story.append(Paragraph(data.notes, st["note"]))
        story.append(Spacer(1, 5*mm))

    # Footer
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width="100%", thickness=0.3,
                             color=colors.HexColor("#AAAAAA"), spaceAfter=3))
    story.append(Paragraph(
        f"Hydration Monitoring System &nbsp;·&nbsp; Session #{data.session_id}",
        st["footer"]))

    doc.build(story)
    return buffer.getvalue()


if __name__ == "__main__":
    session = HydrationSession(
        session_id=7,
        total_intake_ml=800.00,
        adjusted_weight_loss_kg=1.200,
        weight_loss_pct=1.85,
        sweat_rate_lph=1.750,
        fluid_balance_ml=-950.00,
        dehydration_risk="moderate",
        target_intake_min_mlh=700.0,
        target_intake_max_mlh=1200.0,
        interval_minutes=10,
        alert_dehydration=True,
        alert_overhydration=False,
        notes="Athlete presented significant fluid loss during training.",
        calculated_at="2026-05-19 11:00:00",
    )

    pdf_bytes = generate_hydration_pdf(session)

    with open("hydration_report.pdf", "wb") as f:
        f.write(pdf_bytes)

    print("PDF saved → hydration_report.pdf")


