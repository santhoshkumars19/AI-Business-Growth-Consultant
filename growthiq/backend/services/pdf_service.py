from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
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
    """Build a professional 3-page business report matching client requests."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5*cm, leftMargin=1.5*cm,
        topMargin=1.2*cm, bottomMargin=1.2*cm
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Custom Styles ────────────────────────────────────────────────────────
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=26, leading=30, textColor=BRAND_PURPLE,
        spaceAfter=15, alignment=TA_CENTER
    )

    h1_style = ParagraphStyle(
        "PageHeading", parent=styles["Heading1"],
        fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=BRAND_DARK,
        spaceBefore=14, spaceAfter=10, borderPadding=(0,0,2,0)
    )

    h2_style = ParagraphStyle(
        "SubHeading", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=BRAND_DARK,
        spaceBefore=10, spaceAfter=6
    )

    body_style = ParagraphStyle(
        "BodyText", parent=styles["Normal"],
        fontName="Helvetica", fontSize=11, leading=15, textColor=colors.HexColor("#374151")
    )

    meta_label_style = ParagraphStyle(
        "MetaLabel", fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=colors.HexColor("#64748B")
    )
    meta_val_style = ParagraphStyle(
        "MetaVal", fontName="Helvetica", fontSize=11, leading=13, textColor=colors.HexColor("#1E293B")
    )

    # ── PAGE 1: Business Overview ──────────────────────────────────────────
    story.append(Paragraph("■ GrowthIQ AI", ParagraphStyle("Brand", fontName="Helvetica-Bold", fontSize=11, textColor=BRAND_PURPLE, alignment=TA_CENTER)))
    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph("AI Business Growth Report", title_style))
    story.append(Spacer(1, 0.5*cm))

    # 1. Business Information Table
    story.append(Paragraph("Business Information", h2_style))
    biz_info_data = [
        [Paragraph("Business Name", meta_label_style), Paragraph(business.get("business_name", "N/A"), meta_val_style)],
        [Paragraph("Industry", meta_label_style), Paragraph(business.get("industry", "N/A"), meta_val_style)],
        [Paragraph("Location", meta_label_style), Paragraph(f"{business.get('city', '')}, {business.get('state', '')}", meta_val_style)],
        [Paragraph("Report Generated Date", meta_label_style), Paragraph(datetime.now().strftime('%d %B %Y'), meta_val_style)],
    ]
    biz_table = Table(biz_info_data, colWidths=[6*cm, 12*cm])
    biz_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(biz_table)
    story.append(Spacer(1, 0.5*cm))

    # 2. Business Health Score Table
    health_score = analysis.get("health_score", 0)
    score_color = SUCCESS if health_score >= 70 else WARNING if health_score >= 50 else DANGER
    score_hex = f"#{score_color.hexval()}"
    status_label = "STRONG" if health_score >= 70 else "MODERATE" if health_score >= 50 else "CRITICAL"

    story.append(Paragraph("Business Health Score", h2_style))
    score_data = [
        [
            Paragraph(f'<font size="40" color="{score_hex}"><b>{health_score}</b></font><br/><br/><font size="10" color="{score_hex}"><b>{status_label}</b></font>', ParagraphStyle("ScoreVal", alignment=TA_CENTER, leading=22)),
            Paragraph(analysis.get("summary", "No summary available."), body_style)
        ]
    ]
    score_table = Table(score_data, colWidths=[5*cm, 13*cm])
    score_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("BACKGROUND", (0, 0), (0, 0), LIGHT_BG),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 0.5*cm))

    # 3. Key Business Metrics Cards
    story.append(Paragraph("Key Business Metrics", h2_style))
    profit = business.get("monthly_revenue", 0) - business.get("monthly_expenses", 0)
    margin = int(round((profit / business.get("monthly_revenue", 1)) * 100)) if business.get("monthly_revenue", 0) > 0 else 0
    
    metrics_grid_data = [
        [
            Paragraph(f'<b>Monthly Revenue</b><br/><font size="13" color="#10B981">₹{business.get("monthly_revenue", 0):,.0f}</font>', ParagraphStyle("MCard", parent=body_style, leading=16)),
            Paragraph(f'<b>Monthly Expenses</b><br/><font size="13" color="#F59E0B">₹{business.get("monthly_expenses", 0):,.0f}</font>', ParagraphStyle("MCard", parent=body_style, leading=16))
        ],
        [
            Paragraph(f'<b>Net Profit</b><br/><font size="13" color="{SUCCESS.hexval() if profit >= 0 else DANGER.hexval()}">₹{profit:,.0f}</font>', ParagraphStyle("MCard", parent=body_style, leading=16)),
            Paragraph(f'<b>Profit Margin</b><br/><font size="13" color="{SUCCESS.hexval() if margin >= 20 else WARNING.hexval()}">{margin}%</font>', ParagraphStyle("MCard", parent=body_style, leading=16))
        ],
        [
            Paragraph(f'<b>Active Customers</b><br/><font size="13" color="#6366F1">{business.get("monthly_customers", 0):,}</font>', ParagraphStyle("MCard", parent=body_style, leading=16)),
            Paragraph(f'<b>Growth Rate</b><br/><font size="13" color="#6366F1">{business.get("growth_rate", 5)}%</font>', ParagraphStyle("MCard", parent=body_style, leading=16))
        ]
    ]
    metrics_table = Table(metrics_grid_data, colWidths=[9*cm, 9*cm])
    metrics_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAFAFA")),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(metrics_table)

    # ── Page Break to Page 2 ────────────────────────────────────────────────
    story.append(PageBreak())

    # ── PAGE 2: Business Analysis ──────────────────────────────────────────
    story.append(Paragraph("Business SWOT & Performance Analysis", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_PURPLE, spaceAfter=15))

    swot = analysis.get("swot", {})
    swot_table_data = [
        [
            Paragraph("<b>💪 Strengths</b>", ParagraphStyle("SHead", fontName="Helvetica-Bold", fontSize=12, textColor=SUCCESS)),
            Paragraph("<b>⚠️ Weaknesses</b>", ParagraphStyle("WHead", fontName="Helvetica-Bold", fontSize=12, textColor=DANGER))
        ],
        [
            Paragraph("<br/>".join(f"• {s}" for s in swot.get("strengths", [])), ParagraphStyle("SBody", parent=body_style, fontSize=11, leading=15)),
            Paragraph("<br/>".join(f"• {w}" for w in swot.get("weaknesses", [])), ParagraphStyle("WBody", parent=body_style, fontSize=11, leading=15))
        ],
        [
            Paragraph("<b>🚀 Opportunities</b>", ParagraphStyle("OHead", fontName="Helvetica-Bold", fontSize=12, textColor=BRAND_PURPLE)),
            Paragraph("<b>🛡️ Threats</b>", ParagraphStyle("THead", fontName="Helvetica-Bold", fontSize=12, textColor=WARNING))
        ],
        [
            Paragraph("<br/>".join(f"• {o}" for o in swot.get("opportunities", [])), ParagraphStyle("OBody", parent=body_style, fontSize=11, leading=15)),
            Paragraph("<br/>".join(f"• {t}" for t in swot.get("threats", [])), ParagraphStyle("TBody", parent=body_style, fontSize=11, leading=15))
        ]
    ]
    swot_table = Table(swot_table_data, colWidths=[9*cm, 9*cm])
    swot_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#F0FDF4")),
        ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#FFF1F2")),
        ("BACKGROUND", (0, 2), (0, 2), colors.HexColor("#F5F3FF")),
        ("BACKGROUND", (1, 2), (1, 2), colors.HexColor("#FFFBEB")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(swot_table)
    story.append(Spacer(1, 0.8*cm))

    story.append(Paragraph("AI Business Performance Summary", h2_style))
    story.append(Paragraph(analysis.get("summary", "No performance summary available."), body_style))

    # ── Page Break to Page 3 ────────────────────────────────────────────────
    story.append(PageBreak())

    # ── PAGE 3: AI Recommendations ──────────────────────────────────────────
    story.append(Paragraph("AI-Powered Recommendations", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_PURPLE, spaceAfter=15))

    recs = analysis.get("recommendations", [])
    for rec in recs[:3]:  # Top 3 high priority recommendations to fit elegantly on Page 3
        priority = rec.get("priority", "medium").upper()
        p_color = "#EF4444" if priority == "HIGH" else "#F59E0B" if priority == "MEDIUM" else "#10B981"
        cat = rec.get("category", "Digital").upper()

        rec_block = [
            Paragraph(f'<b>✓ {rec.get("title", "Recommendation")}</b>', ParagraphStyle("RTitle", fontName="Helvetica-Bold", fontSize=13, textColor=BRAND_DARK, spaceAfter=4)),
            Paragraph(f'Description: {rec.get("description", "")}', body_style),
            Spacer(1, 0.1*cm),
            Paragraph(f'<b>Expected Impact</b>: {rec.get("impact", "N/A")} | <b>Timeline</b>: {rec.get("timeline", "1-3 Months")} | <b>Expected ROI</b>: {rec.get("expected_roi", "High")}', ParagraphStyle("RMeta", fontName="Helvetica", fontSize=10, textColor=colors.HexColor("#4B5563"))),
            Spacer(1, 0.15*cm),
            Paragraph(f'<font color="{p_color}"><b>● Priority: {priority}</b></font> &nbsp;&nbsp;|&nbsp;&nbsp; <b>Category: {cat}</b>', ParagraphStyle("RBadges", fontName="Helvetica-Bold", fontSize=10, textColor=BRAND_PURPLE)),
            Spacer(1, 0.2*cm),
            HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E7EB"), spaceAfter=10)
        ]
        story.append(KeepTogether(rec_block))

    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("<b>Business Growth Conclusion</b>", h2_style))
    story.append(Paragraph(
        f"Based on the metrics generated for {business.get('business_name')}, implementing these strategic steps "
        f"focused on {business.get('industry', 'your niche')} will strengthen active customer acquisition, lower operational "
        f"friction, and ensure positive trajectory toward your growth milestones.",
        body_style
    ))

    # ── Page Footer ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.6*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_PURPLE))
    story.append(Paragraph(
        f"Generated by GrowthIQ AI · {datetime.now().strftime('%d %B %Y')} · Confidential Business Report",
        ParagraphStyle("Footer", fontName="Helvetica", fontSize=8.5, textColor=colors.grey, alignment=TA_CENTER, spaceBefore=8)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
