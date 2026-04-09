"use client";
import { useEffect, useState } from "react";
// @ts-ignore
import { Joyride, STATUS } from "react-joyride";

interface Props {
  run: boolean;
  onFinish: () => void;
  tourType?: "all" | "textos" | "tvs" | "borrar";
}

export default function VirtualTour({ run, onFinish, tourType = "all" }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allSteps: any[] = [
    {
      id: "tvs",
      target: ".tour-formato",
      content: (
        <div>
          <h3 className="text-sm font-bold text-rose-600 mb-1">Formatos y Menu Wall TVs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Comienza seleccionando si tu diseño será Historia, Post, o TV.<br/>
            <strong>Tip:</strong> Seleccionando 'Formato Horizontal TV' podrás añadir varias Pantallas Sincronizadas si tu menú abarca varios monitores en tu local.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      id: "plantillas",
      target: ".tour-plantillas",
      content: (
        <div>
          <h3 className="text-sm font-bold text-indigo-600 mb-1">Tu punto de partida</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Aquí encontrarás todas las plantillas. Selecciona una base para no empezar desde cero (¡puedes cambiar todo después!).
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      id: "textos",
      target: ".tour-lienzo",
      content: (
        <div>
          <h3 className="text-sm font-bold text-rose-600 mb-1">Editar Textos Mágicos</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Haz clic sobre cualquier texto</strong> en la imagen para activarlo. Notarás un borde punteado. Puedes estirarlo desde las esquinas o moverlo a donde quieras.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      id: "borrar",
      target: ".tour-herramientas",
      content: (
        <div>
          <h3 className="text-sm font-bold text-indigo-600 mb-1">Botones y Borrar Elementos</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Añade nuevos productos o logos desde aquí. <br/><br/>
            <strong>¿Cómo borrar?</strong> Selecciona un elemento en el lienzo y busca el botón rojo de "Eliminar" en el panel de propiedades que aparecerá justo aquí abajo.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      id: "generar",
      target: ".tour-generar",
      content: (
        <div>
          <h3 className="text-sm font-bold text-rose-600 mb-1">Imprimir Diseño</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ¿Todo listo? Clickea este botón y nuestro servidor transformará tu vista previa en una imagen HD o un video animado al instante.
          </p>
        </div>
      ),
      disableBeacon: true,
    }
  ];

  const steps = tourType === "all" ? allSteps : allSteps.filter(s => s.id === tourType);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  if (!isMounted) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      disableOverlayClose={false}
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      locale={{
        back: "Atrás",
        close: "Cerrar",
        last: "¡Terminar!",
        next: "Siguiente",
        skip: "Omitir"
      }}
      // @ts-ignore
      styles={{
        // @ts-ignore
        options: {
          zIndex: 10000,
          primaryColor: "#f43f5e",
          backgroundColor: "#ffffff",
          textColor: "#334155",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "#f43f5e",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "#94a3b8",
          marginRight: 8,
          fontSize: 13,
        },
        buttonSkip: {
          color: "#cbd5e1",
          fontSize: 13,
        }
      }}
    />
  );
}
