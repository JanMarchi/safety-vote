/**
 * Results Dashboard Component
 * Story 3.3: Results Dashboard
 */

import React from 'react';

export interface CandidateResult {
  name: string;
  votes: number;
  percentage: number;
  rank: number;
}

export type ResultData = Record<string, any> & {
  abstentions?: number;
};

export interface ResultsDashboardProps {
  electionTitle: string;
  totalVotes: number;
  results: ResultData;
  winnerName?: string;
  isTied?: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  electionTitle,
  totalVotes,
  results,
  winnerName,
  isTied = false,
}) => {
  // Extract abstentions and candidate results
  const { abstentions = 0, ...candidateResults } = results;

  // Sort by rank
  const sortedCandidates = Object.entries(candidateResults)
    .sort((a, b) => a[1].rank - b[1].rank)
    .map(([id, data]) => ({ id, ...data }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{electionTitle}</h1>
        <p className="text-gray-600 mt-2">Total de votos: {totalVotes}</p>
      </div>

      {/* Winner Section */}
      {winnerName && (
        <div
          className={`rounded-lg p-6 ${
            isTied
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-green-50 border border-green-200'
          }`}
        >
          <h2 className="font-bold text-lg mb-2">
            {isTied ? '⚠️ Resultado Empatado' : '🏆 Vencedor'}
          </h2>
          <p className="text-2xl font-bold">{winnerName}</p>
        </div>
      )}

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 px-4">Posição</th>
              <th className="text-left py-2 px-4">Candidato</th>
              <th className="text-right py-2 px-4">Votos</th>
              <th className="text-right py-2 px-4">Percentual</th>
            </tr>
          </thead>
          <tbody>
            {sortedCandidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4 font-bold">{candidate.rank}º</td>
                <td className="py-3 px-4">{candidate.name}</td>
                <td className="py-3 px-4 text-right font-medium">
                  {candidate.votes}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-blue-600 rounded"
                        style={{ width: `${candidate.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {candidate.percentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {abstentions > 0 && (
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-3 px-4 text-gray-600">—</td>
                <td className="py-3 px-4 text-gray-600">Abstenções</td>
                <td className="py-3 px-4 text-right font-medium text-gray-600">
                  {abstentions}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {((abstentions / totalVotes) * 100).toFixed(1)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Distribuição de Votos</h3>
        <div className="space-y-3">
          {sortedCandidates.map((candidate) => (
            <div key={candidate.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{candidate.name}</span>
                <span className="text-sm text-gray-600">
                  {candidate.votes} votos
                </span>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded">
                <div
                  className="h-full bg-blue-600 rounded transition-all"
                  style={{ width: `${candidate.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Total de Votos</p>
          <p className="text-2xl font-bold">{totalVotes}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Candidatos</p>
          <p className="text-2xl font-bold">{sortedCandidates.length}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Abstenções</p>
          <p className="text-2xl font-bold">{abstentions}</p>
        </div>
      </div>
    </div>
  );
};
