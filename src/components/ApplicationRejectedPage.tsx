import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Mail, Phone, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';

interface ApplicationRejectedPageProps {
    rejectionReason?: string;
    additionalInfoRequired?: string;
    status: 'rejected' | 'additional_info_required';
}

export function ApplicationRejectedPage({
    rejectionReason,
    additionalInfoRequired,
    status
}: ApplicationRejectedPageProps) {
    const isRejected = status === 'rejected';
    const supportEmail = 'support@ataraxia.app';
    const supportPhone = '1-800-ATARAXIA';

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${isRejected ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                        <AlertCircle className={`w-10 h-10 ${isRejected ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isRejected ? 'Application Update Required' : 'Additional Information Needed'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {isRejected
                            ? 'We need some additional information to process your application'
                            : 'Please provide the requested information to continue'
                        }
                    </p>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="shadow-xl">
                        <CardHeader className={`${isRejected
                                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            } text-white`}>
                            <h2 className="text-2xl font-semibold">What You Need to Do</h2>
                        </CardHeader>

                        <CardContent className="p-8 space-y-6">
                            {/* Reason Display */}
                            {(rejectionReason || additionalInfoRequired) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-blue-900 mb-2">
                                                {isRejected ? 'Reason for Review:' : 'Information Required:'}
                                            </h3>
                                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                                {rejectionReason || additionalInfoRequired}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Next Steps
                                </h3>
                                <ol className="space-y-3 text-gray-700">
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold">
                                            1
                                        </span>
                                        <span>
                                            Review the information requested above
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold">
                                            2
                                        </span>
                                        <span>
                                            Contact our support team using the information below
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold">
                                            3
                                        </span>
                                        <span>
                                            Provide the requested information or documentation via email
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold">
                                            4
                                        </span>
                                        <span>
                                            Our team will review and update your application status
                                        </span>
                                    </li>
                                </ol>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Contact Support
                                </h3>

                                {/* Email */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <a
                                            href={`mailto:${supportEmail}`}
                                            className="text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            {supportEmail}
                                        </a>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <a
                                            href={`tel:${supportPhone}`}
                                            className="text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            {supportPhone}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={() => window.location.href = `mailto:${supportEmail}`}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email Support
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1"
                                >
                                    Back to Home
                                </Button>
                            </div>

                            {/* Timeline Note */}
                            <p className="text-center text-sm text-gray-500 pt-4 border-t">
                                Our support team typically responds within 24-48 hours
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
