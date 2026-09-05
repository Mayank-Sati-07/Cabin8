def validate_invoice(data):

    errors = []

    calculated_subtotal = 0

    for item in data.items:
        calculated_subtotal += item.quantity * item.unit_price

    if data.subtotal is not None:

        if abs(calculated_subtotal - data.subtotal) > 1:

            errors.append(
                f"Subtotal mismatch: calculated {calculated_subtotal}, "
                f"invoice {data.subtotal}"
            )

    if (
        data.subtotal is not None
        and data.tax_total is not None
        and data.grand_total is not None
    ):

        calculated_total = data.subtotal + data.tax_total

        if abs(calculated_total - data.grand_total) > 1:

            errors.append(
                f"Grand total mismatch: calculated {calculated_total}, "
                f"invoice {data.grand_total}"
            )

    return {
        "valid": len(errors) == 0,
        "errors": errors
    }