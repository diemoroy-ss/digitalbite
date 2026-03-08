'use server';

export async function sendToN8n(formData: FormData): Promise<void> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL; 
  
  if (!webhookUrl) {
    console.error("Error: La URL del webhook no está configurada en .env.local");
    return;
  } 
  
  const formType = formData.get('form_type');

  // Datos base compartidos por ambos formularios
  const baseData = {
    tipo_formulario: formType,
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    telefono: formData.get('telefono'),
    origen: 'santisoft.cl',
    fecha: new Date().toISOString()
  };

  // Agregamos los campos específicos dependiendo del formulario
  let finalData;
  if (formType === 'demo_rrss') {
    finalData = {
      ...baseData,
      rubro: formData.get('rubro'),
      idea: formData.get('idea'),
    };
  } else {
    finalData = {
      ...baseData,
      tipo_proyecto: formData.get('tipo_proyecto'),
      descripcion: formData.get('descripcion'),
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData),
    });

    if (!response.ok) {
      throw new Error(`Error en n8n: ${response.statusText}`);
    }
  } catch (e) {
    console.error("Error en el envío al webhook:", e);
    throw e;
  }
}