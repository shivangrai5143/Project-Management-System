import { useState } from 'react';
import { X, Bot, Sparkles, Check, Clock, Send, ChevronDown, ChevronUp, Github } from 'lucide-react';
import { useStandupBot } from '../../context/StandupBotContext';
import { useAuth } from '../../context/AuthContext';

const StandupPrompt = () => {
    const { user } = useAuth();
    const {
        isStandupActive,
        currentSuggestions,
        submitStandupResponse,
        dismissStandup,
        settings,
    } = useStandupBot();

    const [response, setResponse] = useState('');
    const [selectedSuggestions, setSelectedSuggestions] = useState([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isStandupActive) return null;

    const toggleSuggestion = (index) => {
        setSelectedSuggestions(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            }
            return [...prev, index];
        });
    };

    const handleSubmit = async () => {
        if (!response.trim() && selectedSuggestions.length === 0) return;

        setIsSubmitting(true);

        // Build final response
        let finalResponse = response;
        if (selectedSuggestions.length > 0) {
            const suggestionTexts = selectedSuggestions.map(i => currentSuggestions[i].text);
            if (finalResponse) {
                finalResponse += '\n\n' + suggestionTexts.join('\n');
            } else {
                finalResponse = suggestionTexts.join('\n');
            }
        }

        submitStandupResponse(
            user.id,
            user.name,
            finalResponse,
            selectedSuggestions.map(i => currentSuggestions[i])
        );

        setIsSubmitting(false);
        setResponse('');
        setSelectedSuggestions([]);
    };

    const handleSnooze = () => {
        dismissStandup(true);
    };

    const handleDismiss = () => {
        dismissStandup(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleDismiss}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">Daily Standup</h3>
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                            </div>
                            <p className="text-xs text-slate-400">Good morning! Time for your update</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Bot Message */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                        <p className="text-slate-200 text-sm leading-relaxed">
                            👋 Hey {user?.name?.split(' ')[0] || 'there'}! What did you work on yesterday?
                        </p>
                        {currentSuggestions.length > 0 && (
                            <p className="text-slate-400 text-xs mt-2">
                                I found some activity I can add to your update:
                            </p>
                        )}
                    </div>

                    {/* Suggestions */}
                    {currentSuggestions.length > 0 && (
                        <div className="space-y-2">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
                            >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                Suggestions ({currentSuggestions.length})
                            </button>

                            {isExpanded && (
                                <div className="space-y-2 animate-fade-in">
                                    {currentSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => toggleSuggestion(index)}
                                            className={`
                                                w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all
                                                ${selectedSuggestions.includes(index)
                                                    ? 'bg-indigo-500/20 border border-indigo-500/50'
                                                    : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5
                                                ${selectedSuggestions.includes(index)
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-slate-700 text-slate-400'
                                                }
                                            `}>
                                                {selectedSuggestions.includes(index) ? (
                                                    <Check className="w-3 h-3" />
                                                ) : (
                                                    <span className="text-xs">{suggestion.icon}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200">{suggestion.text}</p>
                                                {suggestion.type?.startsWith('github') && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                                        <Github className="w-3 h-3" />
                                                        <span>from GitHub</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Custom Response Input */}
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Add your own notes:</label>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="What else did you work on? Any blockers?"
                            className="w-full h-24 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/30">
                    <button
                        onClick={handleSnooze}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                        <Clock className="w-4 h-4" />
                        Snooze {settings.snoozeDuration}min
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!response.trim() && selectedSuggestions.length === 0)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                            ${(!response.trim() && selectedSuggestions.length === 0)
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                            }
                        `}
                    >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StandupPrompt;
