import React, { useState } from 'react';
import { LifeBuoy, MessageSquare, AlertCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';

const Support = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            id: 1,
            question: "How do I add a new rider?",
            answer: "Navigate to the Riders page and click on 'Invite Rider'. You can send an invitation via email."
        },
        {
            id: 2,
            question: "My payout is delayed, what should I do?",
            answer: "Payouts usually take 24-48 hours. If it has been longer, please check your bank details in the Finance section or contact support."
        },
        {
            id: 3,
            question: "How are delivery prices calculated?",
            answer: "Delivery prices are calculated based on the base fare for the weight tier plus the distance multiplier for the specific zone."
        }
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support & Disputes</h1>
                    <p className="text-gray-500 dark:text-gray-400">Get help with your deliveries and account.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <MessageSquare size={18} />
                    <span>New Ticket</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Disputes Section */}
                    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <AlertCircle size={20} className="text-amber-500" />
                                Active Disputes
                            </h2>
                            <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">0 Active</span>
                        </div>
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-500">
                                <LifeBuoy size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No active disputes</h3>
                            <p className="text-gray-500 dark:text-gray-400">Great job! All your deliveries are running smoothly.</p>
                        </div>
                    </section>

                    {/* Contact Support Form */}
                    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Contact Support</h2>
                        </div>
                        <div className="p-6">
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                        <div className="relative">
                                            <select className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                                                <option>Delivery Issue</option>
                                                <option>App Technical Problem</option>
                                                <option>Billing / Finance</option>
                                                <option>Other</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order ID (Optional)</label>
                                        <input type="text" placeholder="#123456" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400 dark:placeholder-gray-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                                    <textarea rows={4} placeholder="Describe your issue detailedly..." className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"></textarea>
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
                                        <Send size={18} />
                                        <span>Send Message</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>

                {/* Sidebar / FAQ */}
                <div className="space-y-6">
                    <section className="bg-indigo-900 text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Need immediate help?</h3>
                            <p className="text-indigo-200 text-sm mb-4">Our support team is available 24/7 to assist you with any critical issues.</p>
                            <button className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                                Call +234 800 LOGIHELP
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-800 rounded-full opacity-50 blur-xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-indigo-500 rounded-full opacity-20 blur-xl"></div>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {faqs.map((faq) => (
                                <div key={faq.id} className="p-4">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                        className="flex items-center justify-between w-full text-left group"
                                    >
                                        <span className="font-medium text-sm text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{faq.question}</span>
                                        {openFaq === faq.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                    </button>
                                    {openFaq === faq.id && (
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-1">
                                            {faq.answer}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Support;
