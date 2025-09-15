import { useState, useEffect, useCallback } from 'react';

// Règles de validation prédéfinies
export const validationRules = {
  required: (value) => {
    if (typeof value === 'string') {
      return value.trim() !== '' || 'Ce champ est obligatoire';
    }
    return value != null && value !== '' || 'Ce champ est obligatoire';
  },

  email: (value) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Adresse email invalide';
  },

  minLength: (min) => (value) => {
    if (!value) return true;
    return value.length >= min || `Minimum ${min} caractères requis`;
  },

  maxLength: (max) => (value) => {
    if (!value) return true;
    return value.length <= max || `Maximum ${max} caractères autorisés`;
  },

  pattern: (regex, message = 'Format invalide') => (value) => {
    if (!value) return true;
    return regex.test(value) || message;
  },

  number: (value) => {
    if (!value) return true;
    return !isNaN(value) || 'Veuillez saisir un nombre valide';
  },

  min: (minValue) => (value) => {
    if (!value) return true;
    return Number(value) >= minValue || `La valeur doit être au moins ${minValue}`;
  },

  max: (maxValue) => (value) => {
    if (!value) return true;
    return Number(value) <= maxValue || `La valeur doit être au maximum ${maxValue}`;
  },

  phone: (value) => {
    if (!value) return true;
    const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/;
    return phoneRegex.test(value.replace(/\s/g, '')) || 'Numéro de téléphone invalide';
  },

  url: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return 'URL invalide';
    }
  },

  password: (value) => {
    if (!value) return true;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const minLength = value.length >= 8;

    if (!minLength) return 'Le mot de passe doit contenir au moins 8 caractères';
    if (!hasUpperCase) return 'Le mot de passe doit contenir au moins une majuscule';
    if (!hasLowerCase) return 'Le mot de passe doit contenir au moins une minuscule';
    if (!hasNumbers) return 'Le mot de passe doit contenir au moins un chiffre';
    if (!hasSpecial) return 'Le mot de passe doit contenir au moins un caractère spécial';

    return true;
  },

  confirmPassword: (passwordField) => (value, formData) => {
    if (!value) return true;
    return value === formData[passwordField] || 'Les mots de passe ne correspondent pas';
  },

  custom: (validatorFn, message) => (value, formData) => {
    const isValid = validatorFn(value, formData);
    return isValid === true || message || 'Valeur invalide';
  }
};

// Hook principal de validation de formulaire
export const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Valider un champ spécifique
  const validateField = useCallback((fieldName, value, allValues = values) => {
    const fieldRules = validationSchema[fieldName];
    if (!fieldRules) return null;

    const rules = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

    for (const rule of rules) {
      const result = rule(value, allValues);
      if (result !== true) {
        return result;
      }
    }

    return null;
  }, [validationSchema, values]);

  // Valider tout le formulaire
  const validateForm = useCallback(() => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName], values);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [validateField, validationSchema, values]);

  // Gérer le changement d'une valeur
  const handleChange = useCallback((fieldName) => (e) => {
    const value = e.target ? e.target.value : e;

    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validation en temps réel si le champ a déjà été touché
    if (touched[fieldName]) {
      const error = validateField(fieldName, value, { ...values, [fieldName]: value });
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [touched, validateField, values]);

  // Gérer le blur (perte de focus)
  const handleBlur = useCallback((fieldName) => () => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    const error = validateField(fieldName, values[fieldName], values);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, [validateField, values]);

  // Réinitialiser le formulaire
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  // Définir plusieurs valeurs à la fois
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Définir une erreur spécifique
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  // Marquer un champ comme touché
  const setFieldTouched = useCallback((fieldName, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: isTouched
    }));
  }, []);

  // Soumettre le formulaire
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);

    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const formIsValid = validateForm();

    if (formIsValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        // Optionnel: gérer les erreurs de soumission
        if (error.fieldErrors) {
          setErrors(prev => ({ ...prev, ...error.fieldErrors }));
        }
      }
    }

    setIsSubmitting(false);
  }, [validationSchema, validateForm, values]);

  // Validation automatique quand les valeurs changent
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const hasErrors = Object.values(errors).some(error => error);
      const hasRequiredFields = Object.keys(validationSchema).length > 0;
      setIsValid(hasRequiredFields && !hasErrors && Object.keys(values).length > 0);
    }
  }, [values, errors, touched, validationSchema]);

  // Utilitaires pour les composants
  const getFieldProps = useCallback((fieldName) => ({
    value: values[fieldName] || '',
    onChange: handleChange(fieldName),
    onBlur: handleBlur(fieldName),
    error: touched[fieldName] ? errors[fieldName] : undefined,
    name: fieldName,
    id: fieldName
  }), [values, handleChange, handleBlur, touched, errors]);

  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  }, [touched, errors]);

  const isFieldValid = useCallback((fieldName) => {
    return touched[fieldName] && !errors[fieldName];
  }, [touched, errors]);

  return {
    // États
    values,
    errors,
    touched,
    isSubmitting,
    isValid,

    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    validateField,
    reset,
    setFieldValues,
    setFieldError,
    setFieldTouched,

    // Utilitaires
    getFieldProps,
    getFieldError,
    isFieldValid,

    // Helpers pour les champs spécifiques
    hasErrors: Object.keys(errors).length > 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues)
  };
};

// Hook simplifié pour des formulaires basiques
export const useSimpleForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = useCallback((fieldName) => (e) => {
    const value = e.target ? e.target.value : e;
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return {
    values,
    handleChange,
    reset,
    setValue: setValues
  };
};

export default useFormValidation;