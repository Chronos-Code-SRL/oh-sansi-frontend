export interface SignInValues {
    email: string;
    password: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

export function validateSignIn(values: SignInValues): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar email
    if (!values.email.trim()) {
        errors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = "Ingrese un email válido";
    }

    // Validar contraseña
    if (!values.password) {
        errors.password = "La contraseña es obligatoria";
    } else if (values.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

export function validateField(
    field: keyof SignInValues,
    values: SignInValues
): ValidationResult {
    const errors: Record<string, string> = {};

    switch (field) {
        case "email":
            if (!values.email.trim()) {
                errors.email = "El email es obligatorio";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
                errors.email = "Ingrese un email válido";
            }
            break;

        case "password":
            if (!values.password) {
                errors.password = "La contraseña es obligatoria";
            } else if (values.password.length < 6) {
                errors.password = "La contraseña debe tener al menos 6 caracteres";
            }
            break;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}
