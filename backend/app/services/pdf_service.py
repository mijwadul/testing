"""
PDF Service – Slip Gaji (Payslip Generator)
Uses ReportLab (pure Python, no native dependencies required).
"""

from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
LOGO_PATH = TEMPLATES_DIR / "logo.png"

# ── Indonesian month names ────────────────────────────────────────────────────
_MONTHS_ID = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
]


def _fmt_date(value: Any) -> str:
    if value is None:
        return "-"
    if isinstance(value, str):
        try:
            from datetime import date as _date

            value = _date.fromisoformat(value)
        except ValueError:
            return value
    return f"{value.day} {_MONTHS_ID[value.month - 1]} {value.year}"


def _fmt_idr(value: Any) -> str:
    try:
        v = float(value or 0)
        # format with dot separator (Indonesian style)
        return "Rp {:,.0f}".format(v).replace(",", ".")
    except (TypeError, ValueError):
        return "Rp 0"


# ── Main generator ────────────────────────────────────────────────────────────


def generate_payroll_pdf(payroll_data: dict[str, Any]) -> bytes:
    """
    Generate a professional payslip PDF.

    payroll_data must contain:
      - employee : Employee ORM object (or dict-like with same attributes)
      - payroll  : PayrollRecord ORM object
      - generated_at : datetime
    """
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import cm, mm
    from reportlab.platypus import (
        HRFlowable,
        Image,
        Paragraph,
        SimpleDocTemplate,
        Spacer,
        Table,
        TableStyle,
    )

    employee = payroll_data["employee"]
    payroll = payroll_data["payroll"]
    generated_at: datetime = payroll_data.get("generated_at", datetime.now())

    # Helper: get attr from ORM object or dict
    def g(obj, key, default=""):
        if obj is None:
            return default
        if isinstance(obj, dict):
            return obj.get(key, default) or default
        return getattr(obj, key, default) or default

    # ── Colors ────────────────────────────────────────────────────────────────
    BRAND_BLUE = colors.HexColor("#1e40af")
    BRAND_LIGHT = colors.HexColor("#dbeafe")
    ACCENT_GREEN = colors.HexColor("#16a34a")
    ACCENT_RED = colors.HexColor("#dc2626")
    GRAY_DARK = colors.HexColor("#1f2937")
    GRAY_MID = colors.HexColor("#6b7280")
    GRAY_LIGHT = colors.HexColor("#f3f4f6")
    WHITE = colors.white

    # ── Document ──────────────────────────────────────────────────────────────
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )
    W, _ = A4
    content_w = W - 3 * cm

    styles = getSampleStyleSheet()

    def style(name="Normal", **kw):
        s = ParagraphStyle(name, parent=styles[name], **kw)
        return s

    # ── Story (elements) ──────────────────────────────────────────────────────
    story = []

    # ── HEADER: Logo + Company name ───────────────────────────────────────────
    logo_cell = ""
    if LOGO_PATH.exists():
        try:
            import io as _io

            from PIL import Image as PILImage

            pil_img = PILImage.open(LOGO_PATH)
            # Pakai resolusi tinggi agar logo tidak buram di PDF
            pil_img.thumbnail((1200, 500), PILImage.LANCZOS)
            thumb_buf = _io.BytesIO()
            pil_img.save(thumb_buf, format="PNG", optimize=True)
            thumb_buf.seek(0)
            # Logo landscape – beri lebar besar, tinggi mengikuti rasio asli
            img = Image(thumb_buf, width=8.5 * cm, height=3.2 * cm, kind="proportional")
            logo_cell = img
        except Exception:
            logo_cell = Paragraph("", styles["Normal"])
    else:
        logo_cell = Paragraph("", styles["Normal"])

    slip_title = Paragraph(
        "<font size='22' color='#1e40af'><b>SLIP GAJI</b></font>",
        style(alignment=TA_RIGHT, spaceAfter=2),
    )
    period_label = Paragraph(
        f"<font size='10' color='#6b7280'>Periode: {_fmt_date(g(payroll, 'period_start'))} – {_fmt_date(g(payroll, 'period_end'))}</font>",
        style(alignment=TA_RIGHT),
    )

    header_data = [
        [
            logo_cell,
            [slip_title, Spacer(1, 8 * mm), period_label],
        ]
    ]
    header_table = Table(header_data, colWidths=[content_w * 0.58, content_w * 0.42])
    header_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(header_table)
    story.append(Spacer(1, 3 * mm))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 4 * mm))

    # ── Employee Info ─────────────────────────────────────────────────────────
    emp_name = g(employee, "name", "—")
    emp_nik = g(employee, "nik", "-")
    emp_position = g(employee, "position", "-")
    emp_dept = g(employee, "department", "-")
    emp_type = g(employee, "employment_type", "-")

    def info_row(label, value):
        return [
            Paragraph(f"<font size='9' color='#6b7280'>{label}</font>", style()),
            Paragraph(f"<font size='9'>:</font>", style(alignment=TA_CENTER)),
            Paragraph(f"<font size='9'><b>{value}</b></font>", style()),
        ]

    emp_info = Table(
        [
            info_row("Nama Karyawan", emp_name),
            info_row("NIK", emp_nik),
            info_row("Jabatan", emp_position),
            info_row("Departemen", emp_dept),
            info_row("Jenis Karyawan", emp_type.capitalize()),
        ],
        colWidths=[3.5 * cm, 0.5 * cm, content_w / 2 - 4 * cm],
    )
    emp_info.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        )
    )

    # Work-days summary (right column)
    payroll_id = g(payroll, "id", "-")
    work_days = g(payroll, "work_days", 0)
    present_days = g(payroll, "present_days", 0)
    absent_days = g(payroll, "absent_days", 0)
    ot_hours = g(payroll, "overtime_hours", 0)

    def wday_row(label, value, bold=False):
        b = "<b>" if bold else ""
        be = "</b>" if bold else ""
        return [
            Paragraph(f"<font size='9' color='#6b7280'>{label}</font>", style()),
            Paragraph(f"<font size='9'>:</font>", style(alignment=TA_CENTER)),
            Paragraph(f"<font size='9'>{b}{value}{be}</font>", style()),
        ]

    work_info = Table(
        [
            wday_row(
                "No. Slip",
                f"SG-{payroll_id:04d}"
                if isinstance(payroll_id, int)
                else f"SG-{payroll_id}",
            ),
            wday_row("Hari Kerja", f"{work_days} hari"),
            wday_row("Hadir", f"{present_days} hari"),
            wday_row("Tidak Hadir", f"{absent_days} hari"),
            wday_row("Jam Lembur", f"{ot_hours} jam"),
        ],
        colWidths=[3.5 * cm, 0.5 * cm, content_w / 2 - 4 * cm],
    )
    work_info.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        )
    )

    two_col = Table([[emp_info, work_info]], colWidths=[content_w / 2, content_w / 2])
    two_col.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(two_col)
    story.append(Spacer(1, 4 * mm))

    # ── Section header helper ─────────────────────────────────────────────────
    def section_header(title: str):
        t = Table(
            [
                [
                    Paragraph(
                        f"<font size='9' color='white'><b>{title}</b></font>", style()
                    )
                ]
            ],
            colWidths=[content_w],
        )
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), BRAND_BLUE),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        return t

    def money_row(label, amount, color=None, bold=False):
        b = "<b>" if bold else ""
        be = "</b>" if bold else ""
        color_tag = f" color='{color}'" if color else ""
        return [
            Paragraph(f"<font size='9'{color_tag}>{b}{label}{be}</font>", style()),
            Paragraph(
                f"<font size='9'{color_tag}>{b}{_fmt_idr(amount)}{be}</font>",
                style(alignment=TA_RIGHT),
            ),
        ]

    # ── PENDAPATAN ────────────────────────────────────────────────────────────
    basic_salary = g(payroll, "basic_salary", 0)
    overtime_amount = g(payroll, "overtime_amount", 0)
    bonus = g(payroll, "bonus", 0)
    allowance = g(payroll, "allowance", 0)
    total_income = g(payroll, "total_income", 0)

    income_rows = [
        money_row("Gaji Pokok", basic_salary),
        money_row(f"Lembur ({ot_hours} jam)", overtime_amount, color="#16a34a"),
        money_row("Bonus", bonus, color="#16a34a"),
        money_row("Tunjangan", allowance, color="#16a34a"),
        money_row("Total Pendapatan", total_income, bold=True),
    ]
    income_table = Table(income_rows, colWidths=[content_w * 0.65, content_w * 0.35])
    income_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 4), (-1, 4), BRAND_LIGHT),
                ("LINEABOVE", (0, 4), (-1, 4), 0.5, BRAND_BLUE),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("ROWBACKGROUNDS", (0, 0), (-1, 3), [WHITE, GRAY_LIGHT]),
            ]
        )
    )

    story.append(section_header("PENDAPATAN"))
    story.append(income_table)
    story.append(Spacer(1, 4 * mm))

    # ── POTONGAN ──────────────────────────────────────────────────────────────
    loan_ded = g(payroll, "loan_deduction", 0)
    debt_ded = g(payroll, "debt_deduction", 0)
    other_ded = g(payroll, "other_deduction", 0)
    total_ded = g(payroll, "total_deduction", 0)
    ded_note = g(payroll, "deduction_note", "")

    deduction_rows = [
        money_row("Potongan Pinjaman", loan_ded, color="#dc2626"),
        money_row("Potongan Hutang ke Perusahaan", debt_ded, color="#dc2626"),
        money_row(
            f"Potongan Lainnya{' – ' + ded_note if ded_note else ''}",
            other_ded,
            color="#dc2626",
        ),
        money_row("Total Potongan", total_ded, bold=True),
    ]
    ded_table = Table(deduction_rows, colWidths=[content_w * 0.65, content_w * 0.35])
    ded_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 3), (-1, 3), colors.HexColor("#fee2e2")),
                ("LINEABOVE", (0, 3), (-1, 3), 0.5, ACCENT_RED),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("ROWBACKGROUNDS", (0, 0), (-1, 2), [WHITE, GRAY_LIGHT]),
            ]
        )
    )

    story.append(section_header("POTONGAN"))
    story.append(ded_table)
    story.append(Spacer(1, 5 * mm))

    # ── TAKE-HOME PAY ─────────────────────────────────────────────────────────
    net_salary = g(payroll, "net_salary", 0)
    takehome_data = [
        [
            Paragraph(
                "<font size='13' color='white'><b>TAKE-HOME PAY (GAJI BERSIH)</b></font>",
                style(alignment=TA_LEFT),
            ),
            Paragraph(
                f"<font size='14' color='white'><b>{_fmt_idr(net_salary)}</b></font>",
                style(alignment=TA_RIGHT),
            ),
        ]
    ]
    takehome_table = Table(
        takehome_data, colWidths=[content_w * 0.55, content_w * 0.45]
    )
    takehome_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BRAND_BLUE),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("ROUNDEDCORNERS", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(takehome_table)
    story.append(Spacer(1, 6 * mm))

    # ── NOTES ────────────────────────────────────────────────────────────────
    notes = g(payroll, "notes", "")
    if notes:
        story.append(
            Paragraph(
                f"<font size='8' color='#92400e'><b>Catatan:</b> {notes}</font>",
                style(),
            )
        )
        story.append(Spacer(1, 4 * mm))

    # ── APPROVAL / SIGNATURE ─────────────────────────────────────────────────
    approved_at = g(payroll, "approved_at", None)
    approved_label = _fmt_date(approved_at) if approved_at else "—"
    payment_status = g(payroll, "payment_status", "—")

    sig_data = [
        [
            Paragraph(
                "<font size='9'>Diterima oleh,</font>", style(alignment=TA_CENTER)
            ),
            Paragraph(
                "<font size='9'>Disetujui oleh,</font>", style(alignment=TA_CENTER)
            ),
        ],
        [
            Paragraph("<br/><br/><br/>", style()),
            Paragraph("<br/><br/><br/>", style()),
        ],
        [
            Paragraph(
                f"<font size='9'>( {emp_name} )</font>", style(alignment=TA_CENTER)
            ),
            Paragraph(
                "<font size='9'>( General Manager )</font>", style(alignment=TA_CENTER)
            ),
        ],
        [
            Paragraph(
                "<font size='8' color='#6b7280'>Karyawan</font>",
                style(alignment=TA_CENTER),
            ),
            Paragraph(
                f"<font size='8' color='#6b7280'>Tanggal: {approved_label}</font>",
                style(alignment=TA_CENTER),
            ),
        ],
    ]
    sig_table = Table(sig_data, colWidths=[content_w / 2, content_w / 2])
    sig_table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (0, -1), 0.5, colors.HexColor("#d1d5db")),
                ("BOX", (1, 0), (1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("BACKGROUND", (0, 0), (0, 0), GRAY_LIGHT),
                ("BACKGROUND", (1, 0), (1, 0), BRAND_LIGHT),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(sig_table)
    story.append(Spacer(1, 4 * mm))

    # ── FOOTER ────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_MID))
    story.append(Spacer(1, 2 * mm))
    story.append(
        Paragraph(
            f"<font size='7' color='#9ca3af'>Slip gaji ini dicetak secara otomatis oleh sistem pada "
            f"{generated_at.strftime('%d %B %Y pukul %H:%M')} · Status: {payment_status.upper()} · "
            f"Dokumen ini sah tanpa tanda tangan basah.</font>",
            style(alignment=TA_CENTER),
        )
    )

    # ── Build PDF ─────────────────────────────────────────────────────────────
    doc.build(story)
    return buf.getvalue()
