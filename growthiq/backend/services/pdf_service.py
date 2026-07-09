from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from datetime import datetime


BRAND_PURPLE = colors.HexColor("#6366F1")
BRAND_DARK   = colors.HexColor("#0F1117")
SUCCESS      = colors.HexColor("#10B981")
WARNING      = colors.HexColor("#F59E0B")
DANGER       = colors.HexColor("#EF4444")
LIGHT_BG     = colors.HexColor("#F8F9FF")


def generate_business_report(business: dict, analysis: dict) -> BytesIO:
    """Build a multi-page PDF report using ReportLab."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Custom Styles ────────────────────────────────────────────────────────
    title_style = ParagraphStyle("Title", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=26, textColor=BRAND_PURPLE,
        spaceAfter=6, alignment=TA_CENTER)

    h2_style = ParagraphStyle("H2", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=14, textColor=BRAND_DARK,
        spaceBefore=16, spaceAfter=8)

    body_style = ParagraphStyle("Body", parent=styles["Normal"],
        fontName="Helvetica", fontSize=10, leading=16, textColor=colors.HexColor("#374151"))

    # ── Header ───────────────────────────────────────────────────────────────
    story.append(Paragraph("■ GrowthIQ AI", ParagraphStyle("Brand",
        fontName="Helvetica-Bold", fontSize=12, textColor=BRAND_PURPLE, alignment=TA_CENTER)))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Business Growth Report", title_style))
    story.append(Paragraph(f"{business.get('industry', business.get('business_name', 'N/A'))} · {business.get('city', '')} · Generated {datetime.now().strftime('%d %B %Y')}", 
        ParagraphStyle("Sub", fontName="Helvetica", fontSize=10, textColor=colors.grey, alignment=TA_CENTER)))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_PURPLE, spaceAfter=16))

    # ── Health Score ─────────────────────────────────────────────────────────
    health_score = analysis.get("health_score", 0)
    score_color = SUCCESS if health_score >= 70 else WARNING if health_score >= 50 else DANGER
    score_hex = f"#{score_color.hexval()}"
    story.append(Paragraph("Business Health Score", h2_style))

    score_data = [
        [Paragraph(f'<font color="{score_hex}">{health_score}</font>', 
            ParagraphStyle("Score", fontName="Helvetica-Bold", fontSize=36, alignment=TA_CENTER)),
         Paragraph(analysis.get("summary", ""), body_style)]
    ]
    score_table = Table(score_data, colWidths=[4*cm, 12*cm])
    score_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (0, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (0, 0), LIGHT_BG),
        ("BACKGROUND", (1, 0), (1, 0), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 0.5*cm))

    # ── Key Metrics ──────────────────────────────────────────────────────────
    story.append(Paragraph("Key Business Metrics", h2_style))
    metrics_data = [
        ["Metric", "Value"],
        ["Monthly Revenue", f"■{business.get('monthly_revenue', 0):,.0f}"],
        ["Monthly Expenses", f"■{business.get('monthly_expenses', 0):,.0f}"],
        ["Monthly Customers", str(business.get('monthly_customers', 0))],
        ["Avg Order Value", f"■{business.get('avg_order_value', 0):,.0f}"],
        ["Profit Margin", f"{business.get('profit_margin', 0)}%"],
        ["Growth Rate", f"{business.get('growth_rate', 0)}%"],
        ["Online Presence", business.get('online_presence', 'N/A').title()],
    ]
    metrics_table = Table(metrics_data, colWidths=[8*cm, 8*cm])
    metrics_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_PURPLE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 11),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ("FONTSIZE", (0, 1), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("ALIGN", (0, 0), (0, -1), "LEFT"),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 0.5*cm))

    # ── Recommendations ──────────────────────────────────────────────────────
    story.append(Paragraph("AI Recommendations", h2_style))
    for i, rec in enumerate(analysis.get("recommendations", [])[:8], 1):
        priority = rec.get("priority", "medium")
        p_color = "#EF4444" if priority == "high" else "#F59E0B" if priority == "medium" else "#10B981"
        rec_block = [
            Paragraph(f'{i}. {rec.get("title", "")} <font size="8" color="{p_color}">[{priority.upper()}]</font>', 
                ParagraphStyle("RecTitle", fontName="Helvetica-Bold", fontSize=11, textColor=BRAND_DARK, spaceAfter=4)),
            Paragraph(rec.get("description", ""), body_style),
            Paragraph(f'Impact: {rec.get("impact", "")}', 
                ParagraphStyle("Impact", fontName="Helvetica-Oblique", fontSize=9, textColor=SUCCESS, spaceAfter=8)),
        ]
        story.append(KeepTogether(rec_block))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E7EB"), spaceAfter=8))

    # ── SWOT ─────────────────────────────────────────────────────────────────
    story.append(Paragraph("SWOT Analysis", h2_style))
    swot = analysis.get("swot", {})
    swot_data = [
        [Paragraph("💪 Strengths", ParagraphStyle("SW", fontName="Helvetica-Bold", fontSize=10, textColor=SUCCESS)),
         Paragraph("⚠️ Weaknesses", ParagraphStyle("SW", fontName="Helvetica-Bold", fontSize=10, textColor=colors.red))],
        [Paragraph("\n".join(f"• {s}" for s in swot.get("strengths", [])), body_style),
         Paragraph("\n".join(f"• {w}" for w in swot.get("weaknesses", [])), body_style)],
        [Paragraph("🚀 Opportunities", ParagraphStyle("SW", fontName="Helvetica-Bold", fontSize=10, textColor=BRAND_PURPLE)),
         Paragraph("🛑 Threats", ParagraphStyle("SW", fontName="Helvetica-Bold", fontSize=10, textColor=WARNING))],
        [Paragraph("\n".join(f"• {o}" for o in swot.get("opportunities", [])), body_style),
         Paragraph("\n".join(f"• {t}" for t in swot.get("threats", [])), body_style)],
    ]
    swot_table = Table(swot_data, colWidths=[8*cm, 8*cm])
    swot_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#ECFDF5")),
        ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#FEF2F2")),
        ("BACKGROUND", (0, 2), (0, 2), colors.HexColor("#EEF2FF")),
        ("BACKGROUND", (1, 2), (1, 2), colors.HexColor("#FFFBEB")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(swot_table)
    story.append(Spacer(1, 0.5*cm))

    # ── Footer ───────────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_PURPLE))
    story.append(Paragraph(
        f"Generated by GrowthIQ AI · {datetime.now().strftime('%d %B %Y %H:%M')} · Confidential",
        ParagraphStyle("Footer", fontName="Helvetica", fontSize=8, textColor=colors.grey, alignment=TA_CENTER, spaceBefore=8)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer

