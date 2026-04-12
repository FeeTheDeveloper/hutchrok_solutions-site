interface PaidServiceEmailPayload {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  selectedService: string;
  projectDetails: string;
}

export async function sendPaidServiceRequestEmail(payload: PaidServiceEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email delivery is not configured. Missing RESEND_API_KEY.");
  }

  const from = process.env.RESEND_FROM_EMAIL || "Hutchrok Intake <onboarding@resend.dev>";

  const text = [
    "New paid service request",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Business Name: ${payload.businessName}`,
    `Selected Service: ${payload.selectedService}`,
    "",
    "Project Details:",
    payload.projectDetails,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: ["contact@hutchrok.com"],
      reply_to: payload.email,
      subject: `Paid Service Request: ${payload.selectedService}`,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error (${response.status}): ${body}`);
  }
}
