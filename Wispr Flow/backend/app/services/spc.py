from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Sample, SampleType, Machine, Alert, AlertSeverity


def evaluate_sample(sample: Sample, sample_type: SampleType, machine: Machine, db: Session) -> Alert | None:
    value = sample.value
    lsl = sample_type.lower_spec_limit
    usl = sample_type.upper_spec_limit
    target = sample_type.target

    if target == 0 and lsl == 0 and usl == 0:
        return None

    if value < lsl:
        return Alert(
            machine_id=machine.id,
            sample_id=sample.id,
            severity=AlertSeverity.CRITICAL,
            message=f"{machine.name}: {sample_type.name} = {value:.3f} below lower spec limit ({lsl})",
        )
    if value > usl:
        return Alert(
            machine_id=machine.id,
            sample_id=sample.id,
            severity=AlertSeverity.CRITICAL,
            message=f"{machine.name}: {sample_type.name} = {value:.3f} above upper spec limit ({usl})",
        )

    recent = (
        db.query(Sample.value)
        .filter(
            Sample.machine_id == machine.id,
            Sample.sample_type_id == sample_type.id,
            Sample.id != sample.id,
        )
        .order_by(Sample.measured_at.desc())
        .limit(20)
        .all()
    )
    values = [v[0] for v in recent]
    if len(values) < 5:
        return None
    values.append(value)

    mean = sum(values) / len(values)
    std = (sum((x - mean) ** 2 for x in values) / len(values)) ** 0.5 or 0.0001
    z_score = (value - mean) / std
    target_offset = abs(value - target)

    if abs(z_score) > 3:
        return Alert(
            machine_id=machine.id,
            sample_id=sample.id,
            severity=AlertSeverity.WARNING,
            message=f"{machine.name}: {sample_type.name} = {value:.3f} ({z_score:+.1f}σ from mean)",
        )
    if target_offset > (usl - lsl) * 0.4:
        return Alert(
            machine_id=machine.id,
            sample_id=sample.id,
            severity=AlertSeverity.INFO,
            message=f"{machine.name}: {sample_type.name} = {value:.3f} drifting from target ({target})",
        )

    return None
