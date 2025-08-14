"use server";

export async function submitData(formData: FormData) {
  const webhookUrl = "https://kirmada001200.app.n8n.cloud/webhook/6db52c93-a96d-4569-b380-c73199ba5613";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      try {
        await response.json();
        return { success: true, message: "Data submitted successfully!" };
      } catch (error) {
        return { success: false, message: "Received an invalid response from the server." };
      }
    } else {
      const errorText = await response.text();
      return { success: false, message: `Submission failed: ${response.status} ${response.statusText}. Details: ${errorText}` };
    }
  } catch (error) {
    return { success: false, message: error instanceof Error ? `An error occurred: ${error.message}` : "An unknown error occurred." };
  }
}
