'use client';

import { useState } from 'react';
import {
    BookOpen,
    FileText,
    MessageSquareText,
    Search,
    Sparkles,
} from 'lucide-react';
import { useProjects } from '@/context/ProjectContext';
import { useTasks } from '@/context/TaskContext';
import PageHero from '@/components/workspace/PageHero';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/workspace/EmptyState';
import { formatDate } from '@/utils/helpers';

function SectionTitle({ eyebrow, title, description }) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                {title}
            </h2>
            {description && (
                <p className="mt-1 text-sm text-slate-400">
                    {description}
                </p>
            )}
        </div>
    );
}

export default function KnowledgePage() {
    const [activeSection, setActiveSection] = useState('documentation');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [referenceTime] = useState(() => Date.now());

    const { projects, team } = useProjects();
    const { tasks } = useTasks();

    const documentation = projects.map((project) => ({
        id: `doc-${project.id}`,
        section: 'documentation',
        title: `${project.name} brief`,
        description: project.description || 'Project brief and planning context.',
        updatedAt: project.updatedAt,
        content: `# ${project.name}\n\n## Overview\n${project.description || 'Add a project summary.'}\n\n## Delivery Focus\n- Active teammates: ${project.teamIds?.length || 0}\n- Current open tasks: ${tasks.filter((task) => task.projectId === project.id && task.status !== 'done').length}\n- Total completion: ${tasks.filter((task) => task.projectId === project.id && task.status === 'done').length} done\n\n## Notes\nKeep project strategy, links, and current decisions in this workspace note.`,
    }));

    const sops = [
        {
            id: 'sop-sprint-review',
            section: 'sops',
            title: 'Sprint review checklist',
            description: 'Use before marking a sprint healthy or complete.',
            updatedAt: new Date().toISOString(),
            content: '# Sprint review checklist\n\n1. Confirm overdue tasks are either closed or explicitly re-scoped.\n2. Review the burndown and identify flow bottlenecks.\n3. Capture blockers for the next planning session.\n4. Publish a short sprint summary in the workspace updates channel.',
        },
        {
            id: 'sop-bug-triage',
            section: 'sops',
            title: 'Bug triage SOP',
            description: 'Severity, ownership, and escalation path for defect handling.',
            updatedAt: new Date().toISOString(),
            content: '# Bug triage SOP\n\n- Label every defect with severity and owning team.\n- Assign a single decision-maker before engineering work starts.\n- Capture reproduction steps, impacted surfaces, and expected behavior.\n- Review critical issues with ERA for root-cause and mitigation guidance.',
        },
    ];

    const meetingNotes = team.slice(0, 4).map((member, index) => ({
        id: `note-${member.id}`,
        section: 'meeting-notes',
        title: `${member.name.split(' ')[0]} sync notes`,
        description: 'A short running note for standup highlights and follow-ups.',
        updatedAt: new Date(referenceTime - index * 86400000).toISOString(),
        content: `# Team sync\n\n## Highlights\n- ${member.name} is carrying ${tasks.filter((task) => task.assigneeId === member.id && task.status !== 'done').length} active tasks.\n- Completed work this cycle: ${tasks.filter((task) => task.assigneeId === member.id && task.status === 'done').length}\n\n## Follow-ups\n- Confirm blockers before the next standup.\n- Update any decisions that affect project scope or timing.\n`,
    }));

    const aiSummaries = projects.map((project) => {
        const projectTasks = tasks.filter((task) => task.projectId === project.id);
        const doneCount = projectTasks.filter((task) => task.status === 'done').length;
        const openCount = projectTasks.filter((task) => task.status !== 'done').length;

        return {
            id: `ai-${project.id}`,
            section: 'ai-summaries',
            title: `${project.name} AI summary`,
            description: 'Generated workspace summary and next actions.',
            updatedAt: project.updatedAt,
            content: `# ERA summary\n\n${project.name} currently has ${openCount} open tasks and ${doneCount} completed tasks.\n\n## Suggested next actions\n- Review any in-progress work that has not moved recently.\n- Confirm scope for the next sprint pull.\n- Capture decisions and release notes inside the knowledge hub.\n`,
        };
    });

    const sections = {
        documentation,
        sops,
        'meeting-notes': meetingNotes,
        'ai-summaries': aiSummaries,
    };

    const sectionLabels = {
        documentation: 'Documentation',
        sops: 'SOPs',
        'meeting-notes': 'Meeting Notes',
        'ai-summaries': 'AI Summaries',
    };

    const currentDocuments = (sections[activeSection] || []).filter((document) => {
        if (!searchQuery) {
            return true;
        }

        const query = searchQuery.toLowerCase();
        return (
            document.title.toLowerCase().includes(query) ||
            document.description.toLowerCase().includes(query) ||
            document.content.toLowerCase().includes(query)
        );
    });

    const resolvedSelectedId = currentDocuments.some((document) => document.id === selectedId)
        ? selectedId
        : currentDocuments[0]?.id || '';

    const selectedDocument = currentDocuments.find((document) => document.id === resolvedSelectedId);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHero
                eyebrow="Knowledge Hub"
                title="Documentation, SOPs, notes, and AI summaries in one workspace"
                description="A denser home for institutional memory so project context stays discoverable instead of living in scattered chats."
                tone="emerald"
                meta={[
                    { label: 'Docs', value: `${documentation.length}`, hint: 'Project-level briefs and references' },
                    { label: 'SOPs', value: `${sops.length}`, hint: 'Operational playbooks' },
                    { label: 'Notes', value: `${meetingNotes.length}`, hint: 'Recent sync records' },
                    { label: 'AI', value: `${aiSummaries.length}`, hint: 'ERA-generated workspace summaries' },
                ]}
            />

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                <Card padding="dashboard">
                    <SectionTitle
                        eyebrow="Library"
                        title="Knowledge collections"
                        description="Switch between documentation, SOPs, meeting notes, and AI-generated summaries."
                    />
                    <div className="mt-5">
                        <Input
                            icon={Search}
                            placeholder="Search knowledge..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {Object.entries(sectionLabels).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveSection(key)}
                                className={[
                                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                                    activeSection === key
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                                ].join(' ')}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {currentDocuments.length === 0 ? (
                        <div className="mt-5">
                            <EmptyState
                                icon={BookOpen}
                                title="Nothing matched this search"
                                description="Try another query or switch to a different collection."
                                tone="emerald"
                            />
                        </div>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {currentDocuments.map((document) => (
                                <button
                                    key={document.id}
                                    type="button"
                                    onClick={() => setSelectedId(document.id)}
                                    className={[
                                        'w-full rounded-2xl border p-4 text-left transition-colors',
                                        resolvedSelectedId === document.id
                                            ? 'border-emerald-500/25 bg-emerald-500/8'
                                            : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/55',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white">{document.title}</p>
                                            <p className="mt-1 text-sm text-slate-400">{document.description}</p>
                                        </div>
                                        <Badge variant="default" size="sm">
                                            {formatDate(document.updatedAt)}
                                        </Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                <div className="space-y-5">
                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Preview"
                            title={selectedDocument?.title || 'Select a document'}
                            description={selectedDocument?.description || 'Pick a note or document to preview its content.'}
                        />
                        {selectedDocument ? (
                            <>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Badge variant="info" size="md">Markdown</Badge>
                                    <Badge variant="default" size="md">Code Blocks</Badge>
                                    <Badge variant="default" size="md">Attachments</Badge>
                                    <Badge variant="default" size="md">Mentions</Badge>
                                </div>
                                <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                                    <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-300">
                                        {selectedDocument.content}
                                    </pre>
                                </div>
                            </>
                        ) : (
                            <div className="mt-5 rounded-3xl border border-dashed border-slate-800 bg-slate-800/30 p-8 text-center text-sm text-slate-400">
                                Select a document from the left panel to preview it here.
                            </div>
                        )}
                    </Card>

                    <Card padding="dashboard">
                        <SectionTitle
                            eyebrow="Workflow"
                            title="How teams should use this hub"
                            description="A suggested operating model for keeping knowledge fresh and useful."
                        />
                        <div className="mt-5 space-y-3">
                            {[
                                'Store project briefs and release context under Documentation so every delivery stream has a source of truth.',
                                'Move repeatable operating steps into SOPs to reduce onboarding time and process drift.',
                                'Use Meeting Notes for short-lived coordination items, then promote durable decisions into documentation.',
                                'Let ERA summaries highlight risks and action items, then turn those into tasks or sprint decisions.',
                            ].map((item) => (
                                <div key={item} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 text-sm leading-6 text-slate-300">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card padding="dashboard">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-emerald-200" />
                        <div>
                            <p className="text-sm font-semibold text-white">Structured docs</p>
                            <p className="text-sm text-slate-400">Project briefs and reference notes.</p>
                        </div>
                    </div>
                </Card>
                <Card padding="dashboard">
                    <div className="flex items-center gap-3">
                        <MessageSquareText className="h-5 w-5 text-cyan-200" />
                        <div>
                            <p className="text-sm font-semibold text-white">Meeting notes</p>
                            <p className="text-sm text-slate-400">Quick summaries that still stay searchable.</p>
                        </div>
                    </div>
                </Card>
                <Card padding="dashboard">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-violet-200" />
                        <div>
                            <p className="text-sm font-semibold text-white">AI summaries</p>
                            <p className="text-sm text-slate-400">ERA-generated workspace context and next steps.</p>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
}
