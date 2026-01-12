"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Code, Zap, Check, XCircle, Play, FileCode, Layout, GitBranch, Settings, Terminal } from 'lucide-react';

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1 - Portada
    {
      title: "DevPip-AutoTest",
      subtitle: "Sistema de Testing Automatizado con Playwright",
      type: "cover",
      content: (
        <div className="text-center space-y-6">
          <div className="inline-block p-6 bg-blue-500/10 rounded-full mb-4">
            <Code className="w-24 h-24 text-blue-500" />
          </div>
          <p className="text-xl text-gray-300">
            Automatización E2E para sitios web
          </p>
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">1</div>
              <div className="text-sm text-gray-400">Proyecto</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">14</div>
              <div className="text-sm text-gray-400">Tests</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">100%</div>
              <div className="text-sm text-gray-400">Automatizado</div>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 2 - ¿Qué es Playwright?
    {
      title: "¿Qué es Playwright?",
      subtitle: "Framework de testing end-to-end moderno",
      type: "content",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20">
            <p className="text-lg leading-relaxed text-gray-200">
              Playwright es un framework de automatización de navegadores desarrollado por Microsoft que permite 
              realizar pruebas end-to-end confiables y rápidas en aplicaciones web modernas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <h3 className="font-semibold mb-2 text-white">Rápido</h3>
              <p className="text-sm text-gray-300">Ejecución paralela y optimizada</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <Check className="w-8 h-8 text-green-400 mb-2" />
              <h3 className="font-semibold mb-2 text-white">Confiable</h3>
              <p className="text-sm text-gray-300">Auto-waiting y retry automático</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <GitBranch className="w-8 h-8 text-blue-400 mb-2" />
              <h3 className="font-semibold mb-2 text-white">Multi-browser</h3>
              <p className="text-sm text-gray-300">Chromium, Firefox y WebKit</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <Code className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="font-semibold mb-2 text-white">TypeScript</h3>
              <p className="text-sm text-gray-300">Soporte nativo y type-safe</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3 - Arquitectura del Proyecto
    {
      title: "Arquitectura del Proyecto",
      subtitle: "Next.js + Playwright = Testing Dashboard",
      type: "content",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
              <Layout className="w-5 h-5" />
              Stack Tecnológico
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Frontend:</span>
                <span className="ml-2 text-white font-mono">Next.js 15 + React 19</span>
              </div>
              <div>
                <span className="text-gray-400">Testing:</span>
                <span className="ml-2 text-white font-mono">Playwright 1.54</span>
              </div>
              <div>
                <span className="text-gray-400">Estilos:</span>
                <span className="ml-2 text-white font-mono">Tailwind CSS</span>
              </div>
              <div>
                <span className="text-gray-400">UI:</span>
                <span className="ml-2 text-white font-mono">Radix UI + shadcn/ui</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Estructura de Directorios</h3>
            <pre className="text-sm bg-slate-900 p-4 rounded overflow-x-auto">
              <code className="text-gray-300">{`devpip-autotest/
├── tests/                    # Tests de Playwright
│   ├── pip/                  # Partner in Publishing
│   ├── gp/                   # Grade Potential
│   ├── itopia/               # Itopia
│   └── mm/                   # Metric Marine
├── src/
│   ├── app/                  # Next.js App Router
│   │   └── api/              # API Routes
│   │       └── run-test/     # Ejecución de tests
│   └── components/           # Componentes React
│       └── TestContent.tsx   # Dashboard principal
└── playwright.config.ts      # Configuración`}</code>
            </pre>
          </div>
        </div>
      )
    },

    // Slide 4 - Configuración de Playwright
    {
      title: "Configuración de Playwright",
      subtitle: "playwright.config.ts",
      type: "content",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-400">Configuración Multi-Proyecto</h3>
            </div>
            <pre className="text-sm bg-slate-900 p-4 rounded overflow-x-auto">
              <code className="text-gray-300">{`import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { 
    outputFolder: 'playwright-report', 
    open: 'never' 
  }]],
  outputDir: 'test-results',  
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure', 
  },
  projects: [
    {
      name: 'pip',
      use: { baseURL: 'https://partnerinpublishing.com/' }
    },
    // ... más proyectos
  ],
});`}</code>
            </pre>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold mb-2 text-blue-400">Screenshots</h4>
              <p className="text-sm text-gray-300">Solo en fallos</p>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <h4 className="font-semibold mb-2 text-purple-400">Videos</h4>
              <p className="text-sm text-gray-300">Retenidos al fallar</p>
            </div>
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <h4 className="font-semibold mb-2 text-green-400">Traces</h4>
              <p className="text-sm text-gray-300">Para debugging</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5 - Estructura de Tests
    {
      title: "Estructura de Tests",
      subtitle: "Organización por proyecto y funcionalidad",
      type: "content",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
              <FileCode className="w-5 h-5" />
              Organización de Tests
            </h3>
            <pre className="text-sm bg-slate-900 p-4 rounded overflow-x-auto">
              <code className="text-gray-300">{`tests/
└── pip/
    ├── home/
    │   ├── menu-links-footer.spec.ts
    │   ├── home-anchor.spec.ts
    │   ├── home-cards-navigation.spec.ts
    │   ├── form-validation.spec.ts
    │   └── form-validation-hubspot.spec.ts
    ├── about/
    │   ├── about-anchor.spec.ts
    │   ├── videos-visible.spec.ts
    │   └── team-pip.spec.ts
    └── services/
        └── ...`}</code>
            </pre>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/20">
            <h4 className="font-semibold mb-3 text-white">Categorías de Tests</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300"><strong>Navegación:</strong> Menús, enlaces, anclas, footer</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300"><strong>Formularios:</strong> Validación, integración HubSpot</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300"><strong>Contenido:</strong> Imágenes, videos, texto, cards</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300"><strong>Responsive:</strong> Visibilidad en diferentes viewports</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6 - Ejemplo de Test Simple
    {
      title: "Ejemplo de Test: Navegación con Anclas",
      subtitle: "Test de funcionalidad de scroll suave",
      type: "content",
      content: (
        <div className="space-y-4">
          <pre className="text-sm bg-slate-900 p-4 rounded overflow-x-auto border border-slate-700">
            <code className="text-gray-300">{`import { test, expect } from "@playwright/test";

test("PARTNER WITH US button navigates to its section", 
  async ({ page }) => {
  
  // 1. Cargar homepage (usa baseURL del config)
  await page.goto("/");

  // 2. Verificar que el hash NO está presente
  expect(page.url()).not.toContain("#brxe-3e26fd");

  // 3. Click en el botón anchor
  await page.locator("#brxe-zabhlg").click();
  await page.waitForTimeout(1000);

  // 4. Esperar cambio de hash
  await expect
    .poll(() => page.evaluate(() => window.location.hash))
    .toBe("#brxe-3e26fd");

  // 5. Verificar que la sección está visible
  const target = page.locator("#brxe-3e26fd");
  await expect(target).toBeVisible();
  await expect(target).toBeInViewport();
});`}</code>
          </pre>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
              <h4 className="font-semibold mb-2 text-blue-400">Auto-waiting</h4>
              <p className="text-gray-300">Playwright espera automáticamente a que los elementos estén listos</p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded border border-purple-500/20">
              <h4 className="font-semibold mb-2 text-purple-400">Locators</h4>
              <p className="text-gray-300">Selección robusta de elementos con retry automático</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7 - Test Complejo
    {
      title: "Ejemplo de Test: Validación de Equipo",
      subtitle: "Test complejo con múltiples validaciones",
      type: "content",
      content: (
        <div className="space-y-4">
          <pre className="text-xs bg-slate-900 p-4 rounded overflow-x-auto border border-slate-700">
            <code className="text-gray-300">{`test("team members load with valid data", async ({ page }) => {
  // 1. Ir a página About
  await page.goto("/about/");

  // 2. Scroll para lazy-loading
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, 
                      behavior: "smooth" })
  );
  await page.waitForTimeout(2000);

  // 3. Obtener todos los miembros del equipo
  const members = page.locator(".jet-listing-grid__item");
  const count = await members.count();
  expect(count).toBeGreaterThanOrEqual(8);

  // 4. Validar cada miembro
  for (let i = 0; i < count; i++) {
    const card = members.nth(i);

    // Validar imagen
    const image = card.locator("img.jet-listing-dynamic-image__img");
    await expect(image).toBeVisible();
    let src = await image.getAttribute("src");
    expect(src).toMatch(/^https?:\\/\\//);
    
    // Validar nombre (mínimo 2 palabras)
    const name = card.locator(".brxe-anhjux .jet-listing-dynamic-field__content");
    const nameText = (await name.innerText()).trim();
    expect(nameText.split(/\\s+/).length).toBeGreaterThanOrEqual(2);

    // Validar enlace a LinkedIn
    const link = card.locator("a.jet-listing-dynamic-link__link");
    await expect(link).toHaveAttribute("href", /linkedin\\.com/);
    await expect(link).toHaveAttribute("target", "_blank");
  }
});`}</code>
          </pre>

          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded border border-green-500/20">
            <h4 className="font-semibold mb-2 text-green-400">Características destacadas:</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Manejo de lazy-loading con scroll programático</li>
              <li>• Iteración sobre múltiples elementos con .nth()</li>
              <li>• Validaciones de atributos con regex</li>
              <li>• Verificación de carga de imágenes</li>
            </ul>
          </div>
        </div>
      )
    },

    // Slide 8 - Ejecución de Tests
    {
      title: "Ejecución de Tests",
      subtitle: "Cómo funciona el sistema de ejecución",
      type: "content",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-400">API Route: /api/run-test</h3>
            </div>
            <pre className="text-xs bg-slate-900 p-4 rounded overflow-x-auto">
              <code className="text-gray-300">{`// Spawn de proceso Playwright
const args = ["playwright", "test"];
if (testPath) args.push(testPath);
if (project) args.push("--project", project);

const child = spawn("npx", args, {
  cwd: process.cwd(),
  shell: true,
});

// Stream en tiempo real al frontend
const stream = new ReadableStream({
  async start(controller) {
    child.stdout.on("data", (data) => {
      // Enviar output al cliente
      controller.enqueue(textEncoder.encode(clean));
    });
  }
});`}</code>
            </pre>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
              <div className="text-2xl mb-1">1️⃣</div>
              <h4 className="font-semibold text-sm mb-1 text-blue-400">Spawn</h4>
              <p className="text-xs text-gray-300">Ejecuta Playwright CLI</p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded border border-purple-500/20">
              <div className="text-2xl mb-1">2️⃣</div>
              <h4 className="font-semibold text-sm mb-1 text-purple-400">Stream</h4>
              <p className="text-xs text-gray-300">Output en tiempo real</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded border border-green-500/20">
              <div className="text-2xl mb-1">3️⃣</div>
              <h4 className="font-semibold text-sm mb-1 text-green-400">Report</h4>
              <p className="text-xs text-gray-300">Copia archivos a /public</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 rounded border border-orange-500/20">
            <h4 className="font-semibold mb-2 text-orange-400">Post-procesamiento:</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>✓ Copia reporte HTML a /public/reports/[project]</li>
              <li>✓ Personaliza título y favicon del reporte</li>
              <li>✓ Recolecta screenshots y videos</li>
              <li>✓ Guarda historial en testHistory.json</li>
            </ul>
          </div>
        </div>
      )
    },

    // Slide 9 - Dashboard Web
    {
      title: "Dashboard Web Interactivo",
      subtitle: "Interfaz moderna para gestión de tests",
      type: "content",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Características del Dashboard</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-900 p-4 rounded">
                <h4 className="font-semibold mb-2 text-green-400">Test Runner</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Selección de tests individuales o todos</li>
                  <li>• Ejecución automática programada</li>
                  <li>• Logs en tiempo real con colores</li>
                  <li>• Contador de passed/failed</li>
                </ul>
              </div>
              
              <div className="bg-slate-900 p-4 rounded">
                <h4 className="font-semibold mb-2 text-purple-400">Reportes</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Visualización HTML interactiva</li>
                  <li>• Exportación a PDF</li>
                  <li>• Screenshots de fallos</li>
                  <li>• Videos de ejecución</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded border border-blue-500/20">
              <h4 className="font-semibold mb-2 text-blue-400">Test History</h4>
              <p className="text-sm text-gray-300">
                Historial completo de ejecuciones con fecha, resultados, screenshots, videos y errores. 
                Incluye integración con IA para análisis de fallos.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded">
            <h4 className="font-semibold mb-2 text-yellow-400">Ejecución Automática</h4>
            <p className="text-sm text-gray-300 mb-3">Configurable con intervalos:</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-800 p-2 rounded text-center text-gray-300">30 seg</div>
              <div className="bg-slate-800 p-2 rounded text-center text-gray-300">1 hora</div>
              <div className="bg-slate-800 p-2 rounded text-center text-gray-300">12 horas</div>
              <div className="bg-slate-800 p-2 rounded text-center text-gray-300">24 horas</div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 10 - Mejores Prácticas
    {
      title: "Mejores Prácticas con Playwright",
      subtitle: "Aprendizajes del proyecto",
      type: "content",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 p-4 rounded border border-green-500/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                Do's
              </h4>
              <ul className="text-sm space-y-2 text-gray-300">
                <li>✓ Usar locators específicos (ID, data-testid)</li>
                <li>✓ Aprovechar auto-waiting de Playwright</li>
                <li>✓ Organizar tests por funcionalidad</li>
                <li>✓ Usar expect.poll() para estados dinámicos</li>
                <li>✓ Configurar screenshots solo en fallos</li>
                <li>✓ Usar baseURL en configuración</li>
              </ul>
            </div>

            <div className="bg-red-500/10 p-4 rounded border border-red-500/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                Don'ts
              </h4>
              <ul className="text-sm space-y-2 text-gray-300">
                <li>✗ Evitar waits fijos innecesarios</li>
                <li>✗ No usar selectores frágiles (XPath complejo)</li>
                <li>✗ No hacer tests interdependientes</li>
                <li>✗ No hardcodear URLs completas</li>
                <li>✗ No ignorar timeouts sin razón</li>
                <li>✗ No hacer tests demasiado largos</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded border border-blue-500/20">
            <h4 className="font-semibold mb-2 text-blue-400">Patrón de Test Recomendado</h4>
            <pre className="text-xs bg-slate-900 p-3 rounded overflow-x-auto">
              <code className="text-gray-300">{`// ✅ Test bien estructurado
test("descriptive test name", async ({ page }) => {
  // 1. Arrange: Configurar estado inicial
  await page.goto("/");
  
  // 2. Act: Realizar acción
  await page.locator("[data-testid='button']").click();
  
  // 3. Assert: Verificar resultado
  await expect(page.locator(".result")).toBeVisible();
});`}</code>
            </pre>
          </div>

          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <h4 className="font-semibold mb-2 text-yellow-400">Tips de Performance</h4>
            <div className="text-sm space-y-1 text-gray-300">
              <p>• Ejecutar tests en paralelo con múltiples workers</p>
              <p>• Usar headless: true para CI/CD</p>
              <p>• Reutilizar contextos de navegador cuando sea posible</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 11 - Conclusiones
    {
      title: "Conclusiones",
      subtitle: "Ventajas del sistema implementado",
      type: "content",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-lg border border-green-500/20">
              <h4 className="font-semibold mb-3 text-green-400 text-lg">Beneficios Técnicos</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ Tests confiables y mantenibles</li>
                <li>✓ Ejecución rápida y paralela</li>
                <li>✓ Debugging sencillo con traces</li>
                <li>✓ Multi-proyecto desde un solo lugar</li>
                <li>✓ Reportes visuales completos</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold mb-3 text-blue-400 text-lg">Beneficios de Negocio</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ Detección temprana de bugs</li>
                <li>✓ Reducción de QA manual</li>
                <li>✓ Confianza en deploys</li>
                <li>✓ Documentación viviente</li>
                <li>✓ Monitoreo continuo</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 rounded-lg border border-orange-500/20">
            <h4 className="font-semibold mb-3 text-orange-400 text-lg">Próximos Pasos</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <p className="font-semibold text-white mb-2">Corto plazo:</p>
                <ul className="space-y-1">
                  <li>• Integración con CI/CD</li>
                  <li>• Notificaciones automáticas</li>
                  <li>• Más tests de regresión</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-2">Largo plazo:</p>
                <ul className="space-y-1">
                  <li>• Tests de performance</li>
                  <li>• Análisis con IA</li>
                  <li>• Auto-healing tests</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-lg">
              <p className="text-2xl font-bold text-white">¿Preguntas?</p>
              <p className="text-gray-200 mt-2">Gracias por su atención</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Slide Container */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl shadow-2xl border border-slate-700 p-12 min-h-[600px] flex flex-col">
          {/* Header */}
          <div className="mb-8 border-b border-slate-700 pb-6">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {currentSlideData.title}
            </h1>
            <p className="text-xl text-gray-400">{currentSlideData.subtitle}</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {currentSlideData.content}
          </div>

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Anterior</span>
              </button>

              {/* Slide indicators */}
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'bg-blue-500 w-8' 
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-500">
              Slide {currentSlide + 1} de {slides.length}
            </div>
          </div>
        </div>

        {/* Controls hint */}
        <div className="mt-4 text-center text-sm text-gray-500 font-">
          by DevPip
        </div>
      </div>
    </div>
  );
};

export default Presentation;