/**
 * Fixture deliberadamente no conforme para comprobar el quality gate de Sonar.
 *
 * Este archivo debe ser analizado por Sonar, pero no debe importarse ni ejecutarse
 * desde la aplicacion. Cada bloque conserva un defecto intencionado.
 */

// S2068: credencial escrita directamente en el codigo.
export const databasePassword = "admin123";

// S4507: los puntos de interrupcion no deben llegar a codigo analizado.
export function inspectOrder(): void {
  debugger;
}

// S1523: ejecutar texto como codigo es sensible desde el punto de vista de seguridad.
export function executeExpression(expression: string): unknown {
  return eval(expression);
}

// S2674: parseInt debe recibir siempre la base numerica.
export function parseQuantity(rawQuantity: string): number {
  return parseInt(rawQuantity);
}

// S1764: comparar una expresion consigo misma produce siempre el mismo resultado.
export function isSameCustomer(customerId: string): boolean {
  return customerId === customerId;
}

// S1656: la autoasignacion no modifica el valor.
export function keepAttempts(attempts: number): number {
  attempts = attempts;
  return attempts;
}

// S1871: dos ramas diferentes contienen exactamente la misma implementacion.
export function shippingMessage(country: string): string {
  let message: string;

  if (country === "ES") {
    message = "Envio nacional";
    console.log(message);
  } else if (country === "PT") {
    message = "Envio nacional";
    console.log(message);
  } else {
    message = "Envio internacional";
  }

  return message;
}

// S2486: una excepcion no debe ignorarse silenciosamente.
export function readFixtureConfiguration(rawConfiguration: string): object {
  try {
    return JSON.parse(rawConfiguration) as object;
  } catch {
  }

  return {};
}

// S3776: complejidad cognitiva superior al umbral predeterminado.
export function calculateRiskScore(
  amount: number,
  attempts: number,
  country: string,
  isNewCustomer: boolean,
  hasVerifiedEmail: boolean,
): number {
  let risk = 0;

  if (amount > 1_000) {
    risk += 1;
    if (amount > 5_000) {
      risk += 2;
      if (amount > 10_000) {
        risk += 3;
      }
    }
  }

  if (attempts > 1) {
    risk += 1;
    if (attempts > 3) {
      risk += 2;
      if (attempts > 5) {
        risk += 3;
      }
    }
  }

  if (country !== "ES") {
    risk += 1;
    if (country !== "PT") {
      risk += 2;
    }
  }

  if (isNewCustomer) {
    risk += 1;
    if (!hasVerifiedEmail) {
      risk += 3;
    }
  }

  return risk;
}
