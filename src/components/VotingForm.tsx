/**
 * Voting Form Component
 * Story 3.2: Voting Interface
 */

import React, { useState } from 'react';

export interface Candidate {
  id: string;
  name: string;
  proposal?: string;
  photoUrl?: string;
}

export interface VotingFormProps {
  electionId: string;
  candidates: Candidate[];
  allowAbstention: boolean;
  onSubmit: (candidateId: string | null) => Promise<void>;
  loading?: boolean;
}

export const VotingForm: React.FC<VotingFormProps> = ({
  electionId,
  candidates,
  allowAbstention,
  onSubmit,
  loading = false,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCandidateId && !allowAbstention) {
      setError('Você deve selecionar um candidato');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(selectedCandidateId);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao registrar voto'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-green-900 mb-2">
          ✓ Voto Registrado
        </h3>
        <p className="text-green-700">
          Seu voto foi criptografado e armazenado com segurança.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Selecione um Candidato</h3>

        {candidates.map((candidate) => (
          <label
            key={candidate.id}
            className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="radio"
              name="candidate"
              value={candidate.id}
              checked={selectedCandidateId === candidate.id}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="mt-1"
            />
            <div className="ml-4 flex-1">
              <p className="font-bold text-gray-900">{candidate.name}</p>
              {candidate.proposal && (
                <p className="text-sm text-gray-600 mt-1">
                  {candidate.proposal}
                </p>
              )}
            </div>
          </label>
        ))}

        {allowAbstention && (
          <label className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="candidate"
              value=""
              checked={selectedCandidateId === null}
              onChange={() => setSelectedCandidateId(null)}
              className="mt-1"
            />
            <div className="ml-4">
              <p className="font-bold text-gray-900">Abster-se</p>
              <p className="text-sm text-gray-600">Não votar em nenhum candidato</p>
            </div>
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        {isSubmitting ? 'Processando...' : 'Confirmar Voto'}
      </button>
    </form>
  );
};
