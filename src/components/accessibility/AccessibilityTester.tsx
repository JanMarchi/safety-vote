// Componente para testes de acessibilidade
// Integração com axe-core para verificações automáticas

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Keyboard, Volume2 } from 'lucide-react';

interface AccessibilityResult {
  violations: any[];
  passes: any[];
  incomplete: any[];
  timestamp: Date;
}

interface AccessibilityTesterProps {
  enabled?: boolean;
  showResults?: boolean;
  onResults?: (results: AccessibilityResult) => void;
}

// Componente principal do testador de acessibilidade
export default function AccessibilityTester({ 
  enabled = process.env.NODE_ENV === 'development',
  showResults = true,
  onResults 
}: AccessibilityTesterProps) {
  const [results, setResults] = useState<AccessibilityResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  // Executar teste de acessibilidade
  const runAccessibilityTest = async () => {
    if (!enabled || isRunning) return;
    
    setIsRunning(true);
    
    try {
      // Importar axe-core dinamicamente
      const axe = await import('@axe-core/react');
      
      // Configurar axe para português
      axe.configure({
        locale: {
          lang: 'pt-BR',
          rules: {
            'color-contrast': {
              description: 'Elementos devem ter contraste de cor suficiente',
              help: 'Garanta que o contraste entre o texto e o fundo seja adequado'
            },
            'keyboard-navigation': {
              description: 'Elementos devem ser navegáveis por teclado',
              help: 'Todos os elementos interativos devem ser acessíveis via teclado'
            },
            'aria-labels': {
              description: 'Elementos devem ter rótulos ARIA apropriados',
              help: 'Use atributos ARIA para melhorar a acessibilidade para leitores de tela'
            }
          }
        }
      });
      
      // Executar análise
      const axeResults = await axe.run(document.body, {
        rules: {
          // Regras específicas para WCAG 2.1 AA
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-order-semantics': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'button-name': { enabled: true },
          'bypass': { enabled: true },
          'document-title': { enabled: true },
          'duplicate-id': { enabled: true },
          'form-field-multiple-labels': { enabled: true },
          'frame-title': { enabled: true },
          'html-has-lang': { enabled: true },
          'html-lang-valid': { enabled: true },
          'image-alt': { enabled: true },
          'input-image-alt': { enabled: true },
          'label': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'meta-refresh': { enabled: true },
          'meta-viewport': { enabled: true },
          'object-alt': { enabled: true },
          'role-img-alt': { enabled: true },
          'scrollable-region-focusable': { enabled: true },
          'select-name': { enabled: true },
          'server-side-image-map': { enabled: true },
          'svg-img-alt': { enabled: true },
          'td-headers-attr': { enabled: true },
          'th-has-data-cells': { enabled: true },
          'valid-lang': { enabled: true },
          'video-caption': { enabled: true }
        }
      });
      
      const testResults: AccessibilityResult = {
        violations: axeResults.violations,
        passes: axeResults.passes,
        incomplete: axeResults.incomplete,
        timestamp: new Date()
      };
      
      setResults(testResults);
      
      if (onResults) {
        onResults(testResults);
      }
      
      // Log resultados no console para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 Teste de Acessibilidade');
        console.log('Violações:', testResults.violations);
        console.log('Sucessos:', testResults.passes.length);
        console.log('Incompletos:', testResults.incomplete.length);
        console.groupEnd();
      }
      
    } catch (error) {
      console.error('Erro ao executar teste de acessibilidade:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Executar teste automaticamente quando o componente monta
  useEffect(() => {
    if (enabled) {
      // Aguardar um pouco para a página carregar completamente
      const timer = setTimeout(runAccessibilityTest, 2000);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  // Não renderizar nada se não estiver habilitado ou não mostrar resultados
  if (!enabled || !showResults) {
    return null;
  }

  return (
    <>
      {/* Botão flutuante para abrir painel */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        aria-label="Abrir painel de acessibilidade"
        title="Teste de Acessibilidade"
      >
        <Eye className="h-6 w-6" />
        {results && results.violations.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {results.violations.length}
          </span>
        )}
      </button>

      {/* Painel de resultados */}
      {showPanel && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Acessibilidade
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={runAccessibilityTest}
                disabled={isRunning}
                className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded transition-colors"
              >
                {isRunning ? 'Testando...' : 'Testar'}
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fechar painel"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-4 max-h-80 overflow-y-auto">
            {!results ? (
              <p className="text-gray-500 text-center py-4">
                Clique em "Testar" para verificar a acessibilidade
              </p>
            ) : (
              <div className="space-y-4">
                {/* Resumo */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <div className="font-semibold text-red-700">{results.violations.length}</div>
                    <div className="text-red-600">Violações</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <div className="font-semibold text-green-700">{results.passes.length}</div>
                    <div className="text-green-600">Sucessos</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                    <div className="font-semibold text-yellow-700">{results.incomplete.length}</div>
                    <div className="text-yellow-600">Incompletos</div>
                  </div>
                </div>

                {/* Violações */}
                {results.violations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      Violações Encontradas
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {results.violations.map((violation, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="font-medium text-red-800 text-sm">
                            {violation.help}
                          </div>
                          <div className="text-red-600 text-xs mt-1">
                            Impacto: {violation.impact} • {violation.nodes.length} elemento(s)
                          </div>
                          {violation.helpUrl && (
                            <a
                              href={violation.helpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-xs hover:underline"
                            >
                              Saiba mais
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                  Último teste: {results.timestamp.toLocaleTimeString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Componente para indicadores de acessibilidade
export function AccessibilityIndicators() {
  return (
    <div className="fixed bottom-4 left-4 z-40 space-y-2">
      {/* Indicador de navegação por teclado */}
      <div className="bg-white border border-gray-300 rounded-lg p-2 shadow-sm">
        <div className="flex items-center space-x-2 text-sm">
          <Keyboard className="h-4 w-4 text-blue-600" />
          <span className="text-gray-700">Tab para navegar</span>
        </div>
      </div>
      
      {/* Indicador de leitor de tela */}
      <div className="bg-white border border-gray-300 rounded-lg p-2 shadow-sm">
        <div className="flex items-center space-x-2 text-sm">
          <Volume2 className="h-4 w-4 text-green-600" />
          <span className="text-gray-700">Compatível com leitores de tela</span>
        </div>
      </div>
    </div>
  );
}

// Hook para usar testes de acessibilidade
export function useAccessibilityTest() {
  const [results, setResults] = useState<AccessibilityResult | null>(null);
  
  const runTest = async () => {
    try {
      const axe = await import('@axe-core/react');
      const axeResults = await axe.run();
      
      const testResults: AccessibilityResult = {
        violations: axeResults.violations,
        passes: axeResults.passes,
        incomplete: axeResults.incomplete,
        timestamp: new Date()
      };
      
      setResults(testResults);
      return testResults;
    } catch (error) {
      console.error('Erro no teste de acessibilidade:', error);
      return null;
    }
  };
  
  return { results, runTest };
}