import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Smile,
    Meh,
    Frown,
    Zap,
    Cloud,
    Sun,
    Moon,
    Heart,
    TrendingUp,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

interface JournalEntry {
    id: string;
    date: Date;
    mood: 'happy' | 'neutral' | 'sad';
    energy: number; // 1-10
    stress: number; // 1-10
    gratitude?: string;
    reflection?: string;
    highlights?: string;
}

export function ClientJournalView() {
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
    const [energy, setEnergy] = useState([5]);
    const [stress, setStress] = useState([5]);
    const [gratitude, setGratitude] = useState('');
    const [reflection, setReflection] = useState('');
    const [highlights, setHighlights] = useState('');

    // Mock data - replace with API
    const [entries, setEntries] = useState<JournalEntry[]>([
        {
            id: '1',
            date: new Date(2026, 0, 1),
            mood: 'happy',
            energy: 8,
            stress: 3,
            gratitude: 'My morning coffee and a beautiful sunrise',
            reflection: 'Felt really productive today. Made progress on my goals.',
            highlights: 'Had a great conversation with a friend'
        },
        {
            id: '2',
            date: new Date(2025, 11, 31),
            mood: 'neutral',
            energy: 6,
            stress: 5,
            gratitude: 'A quiet evening at home',
            reflection: 'Feeling a bit tired but grateful for rest.',
        }
    ]);

    const getMoodIcon = (mood: string, size: string = 'w-6 h-6') => {
        switch (mood) {
            case 'happy': return <Smile className={`${size} text-green-500`} />;
            case 'neutral': return <Meh className={`${size} text-yellow-500`} />;
            case 'sad': return <Frown className={`${size} text-orange-500`} />;
            default: return <Meh className={`${size} text-gray-400`} />;
        }
    };

    const handleSaveEntry = () => {
        if (!selectedMood) return;

        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: new Date(),
            mood: selectedMood,
            energy: energy[0],
            stress: stress[0],
            gratitude: gratitude || undefined,
            reflection: reflection || undefined,
            highlights: highlights || undefined
        };

        setEntries([newEntry, ...entries]);

        // Reset form
        setSelectedMood(null);
        setEnergy([5]);
        setStress([5]);
        setGratitude('');
        setReflection('');
        setHighlights('');
        setShowNewEntry(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                            My Journal
                        </h1>
                        <p className="text-muted-foreground mt-1">Track your mood, energy, and reflections</p>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => setShowNewEntry(!showNewEntry)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Entry
                    </Button>
                </div>

                {/* New Entry Form */}
                <AnimatePresence>
                    {showNewEntry && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Card className="border-2 border-orange-200 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-orange-500" />
                                        How are you feeling today?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    {/* Mood Selection */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                                            Overall Mood
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { mood: 'happy' as const, label: 'Good', icon: <Smile className="w-8 h-8" />, color: 'from-green-400 to-emerald-500' },
                                                { mood: 'neutral' as const, label: 'Okay', icon: <Meh className="w-8 h-8" />, color: 'from-yellow-400 to-orange-400' },
                                                { mood: 'sad' as const, label: 'Low', icon: <Frown className="w-8 h-8" />, color: 'from-orange-400 to-red-400' },
                                            ].map((item) => (
                                                <motion.button
                                                    key={item.mood}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setSelectedMood(item.mood)}
                                                    className={`
                                                        flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all
                                                        ${selectedMood === item.mood
                                                            ? `bg-gradient-to-br ${item.color} text-white border-transparent shadow-lg`
                                                            : 'bg-white border-gray-200 hover:border-orange-300 text-gray-600'
                                                        }
                                                    `}
                                                >
                                                    {item.icon}
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Energy Level */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-500" />
                                            Energy Level: {energy[0]}/10
                                        </label>
                                        <Slider
                                            value={energy}
                                            onValueChange={setEnergy}
                                            max={10}
                                            min={1}
                                            step={1}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>Low</span>
                                            <span>High</span>
                                        </div>
                                    </div>

                                    {/* Stress Level */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                                            <Cloud className="w-4 h-4 text-blue-500" />
                                            Stress Level: {stress[0]}/10
                                        </label>
                                        <Slider
                                            value={stress}
                                            onValueChange={setStress}
                                            max={10}
                                            min={1}
                                            step={1}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>Low</span>
                                            <span>High</span>
                                        </div>
                                    </div>

                                    {/* Gratitude */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            What are you grateful for today?
                                        </label>
                                        <Textarea
                                            value={gratitude}
                                            onChange={(e) => setGratitude(e.target.value)}
                                            placeholder="I'm grateful for..."
                                            className="min-h-[80px] resize-none"
                                        />
                                    </div>

                                    {/* Reflection */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            How was your day?
                                        </label>
                                        <Textarea
                                            value={reflection}
                                            onChange={(e) => setReflection(e.target.value)}
                                            placeholder="Today was..."
                                            className="min-h-[100px] resize-none"
                                        />
                                    </div>

                                    {/* Highlights */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            Today's highlights
                                        </label>
                                        <Textarea
                                            value={highlights}
                                            onChange={(e) => setHighlights(e.target.value)}
                                            placeholder="Something good that happened..."
                                            className="min-h-[80px] resize-none"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleSaveEntry}
                                            disabled={!selectedMood}
                                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                                            size="lg"
                                        >
                                            Save Entry
                                        </Button>
                                        <Button
                                            onClick={() => setShowNewEntry(false)}
                                            variant="outline"
                                            size="lg"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Entries List */}
                <div className="space-y-4">
                    {entries.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow border-gray-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center border-2 border-orange-200">
                                                {getMoodIcon(entry.mood, 'w-8 h-8')}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{format(entry.date, 'EEEE, MMMM d')}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Zap className="w-3 h-3 text-yellow-500" />
                                                        Energy: {entry.energy}/10
                                                    </Badge>
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Cloud className="w-3 h-3 text-blue-500" />
                                                        Stress: {entry.stress}/10
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {entry.gratitude && (
                                        <div className="mb-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                            <p className="text-sm font-semibold text-green-900 mb-1">🙏 Grateful for:</p>
                                            <p className="text-sm text-green-800">{entry.gratitude}</p>
                                        </div>
                                    )}

                                    {entry.reflection && (
                                        <div className="mb-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <p className="text-sm font-semibold text-blue-900 mb-1">💭 Reflection:</p>
                                            <p className="text-sm text-blue-800">{entry.reflection}</p>
                                        </div>
                                    )}

                                    {entry.highlights && (
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                            <p className="text-sm font-semibold text-orange-900 mb-1">✨ Highlights:</p>
                                            <p className="text-sm text-orange-800">{entry.highlights}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {entries.length === 0 && !showNewEntry && (
                    <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="p-12 text-center">
                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No entries yet</h3>
                            <p className="text-gray-500 mb-6">Start tracking your journey today</p>
                            <Button
                                onClick={() => setShowNewEntry(true)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Entry
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
