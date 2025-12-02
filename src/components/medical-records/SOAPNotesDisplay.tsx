export default function SOAPNotesDisplay({
    subjective,
    objective,
    assessment,
    plan,
}: {
    subjective?: string | null;
    objective?: string | null;
    assessment?: string | null;
    plan?: string | null;
}) {
    const hasNotes = subjective || objective || assessment || plan;

    if (!hasNotes) {
        return (
            <div className="text-gray-500 italic">No SOAP notes recorded</div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Subjective */}
            {subjective && (
                <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            S
                        </div>
                        <h4 className="font-semibold text-gray-900">Subjective</h4>
                        <span className="text-xs text-gray-500">(Patient's complaints)</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">{subjective}</div>
                </div>
            )}

            {/* Objective */}
            {objective && (
                <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            O
                        </div>
                        <h4 className="font-semibold text-gray-900">Objective</h4>
                        <span className="text-xs text-gray-500">(Doctor's observations)</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">{objective}</div>
                </div>
            )}

            {/* Assessment */}
            {assessment && (
                <div className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <h4 className="font-semibold text-gray-900">Assessment</h4>
                        <span className="text-xs text-gray-500">(Diagnosis)</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">{assessment}</div>
                </div>
            )}

            {/* Plan */}
            {plan && (
                <div className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            P
                        </div>
                        <h4 className="font-semibold text-gray-900">Plan</h4>
                        <span className="text-xs text-gray-500">(Treatment plan)</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">{plan}</div>
                </div>
            )}
        </div>
    );
}
