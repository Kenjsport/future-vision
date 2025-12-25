import React from 'react';
import { BookOpen, Video, Users, Code, ExternalLink } from 'lucide-react';

export default function Resources({ skill, level }) {
    const getResources = () => {
        // Generate contextual resources based on skill and level
        const skillLower = skill.toLowerCase();

        const resources = {
            courses: [],
            books: [],
            communities: [],
            projects: []
        };

        // Courses
        if (skillLower.includes('python') || skillLower.includes('programming')) {
            resources.courses = [
                { name: 'Python for Everybody (Coursera)', url: 'https://www.coursera.org/specializations/python', platform: 'Coursera' },
                { name: 'Complete Python Bootcamp (Udemy)', url: 'https://www.udemy.com/topic/python/', platform: 'Udemy' },
                { name: 'Python Tutorial (YouTube)', url: 'https://www.youtube.com/results?search_query=python+tutorial', platform: 'YouTube' }
            ];
        } else if (skillLower.includes('web') || skillLower.includes('javascript') || skillLower.includes('react')) {
            resources.courses = [
                { name: 'The Complete Web Developer (Udemy)', url: 'https://www.udemy.com/topic/web-development/', platform: 'Udemy' },
                { name: 'React - The Complete Guide (Udemy)', url: 'https://www.udemy.com/topic/react/', platform: 'Udemy' },
                { name: 'freeCodeCamp Web Development', url: 'https://www.freecodecamp.org/', platform: 'freeCodeCamp' }
            ];
        } else if (skillLower.includes('data') || skillLower.includes('ai') || skillLower.includes('ml') || skillLower.includes('machine learning')) {
            resources.courses = [
                { name: 'Machine Learning by Andrew Ng', url: 'https://www.coursera.org/learn/machine-learning', platform: 'Coursera' },
                { name: 'Data Science Specialization', url: 'https://www.coursera.org/specializations/jhu-data-science', platform: 'Coursera' },
                { name: 'Fast.ai Practical Deep Learning', url: 'https://www.fast.ai/', platform: 'Fast.ai' }
            ];
        } else {
            resources.courses = [
                { name: `${skill} courses on Coursera`, url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`, platform: 'Coursera' },
                { name: `${skill} courses on Udemy`, url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`, platform: 'Udemy' },
                { name: `${skill} tutorials on YouTube`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial`, platform: 'YouTube' }
            ];
        }

        // Books
        resources.books = [
            { name: `Search "${skill}" on Amazon Books`, url: `https://www.amazon.com/s?k=${encodeURIComponent(skill)}+book` },
            { name: `Search "${skill}" on Goodreads`, url: `https://www.goodreads.com/search?q=${encodeURIComponent(skill)}` },
            { name: 'O\'Reilly Learning Platform', url: 'https://www.oreilly.com/' }
        ];

        // Communities
        resources.communities = [
            { name: `r/${skill.replace(/\s+/g, '')} on Reddit`, url: `https://www.reddit.com/search/?q=${encodeURIComponent(skill)}`, icon: '🔴' },
            { name: `${skill} Discord Servers`, url: `https://disboard.org/search?keyword=${encodeURIComponent(skill)}`, icon: '💬' },
            { name: `Stack Overflow - ${skill}`, url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(skill.toLowerCase())}`, icon: '📚' },
            { name: `GitHub - ${skill} Projects`, url: `https://github.com/search?q=${encodeURIComponent(skill)}`, icon: '⭐' }
        ];

        // Project Ideas
        if (level === 'beginner') {
            resources.projects = [
                'Build a simple calculator or to-do list',
                'Create a personal portfolio website',
                'Follow 3-5 beginner tutorials step-by-step',
                'Recreate simple apps you use daily'
            ];
        } else if (level === 'intermediate') {
            resources.projects = [
                'Build a full-stack application with database',
                'Contribute to open-source projects on GitHub',
                'Create a project that solves a real problem you have',
                'Build a clone of a popular app (Twitter, Instagram, etc.)'
            ];
        } else {
            resources.projects = [
                'Architect and build a scalable system',
                'Publish a library or framework',
                'Mentor others and create educational content',
                'Build a SaaS product or startup MVP'
            ];
        }

        return resources;
    };

    const resources = getResources();

    return (
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Learning Resources
            </h2>

            <div className="space-y-6">
                {/* Courses */}
                <div>
                    <h3 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Online Courses
                    </h3>
                    <div className="space-y-2">
                        {resources.courses.map((course, idx) => (
                            <a
                                key={idx}
                                href={course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all group"
                            >
                                <span className="text-white">{course.name}</span>
                                <ExternalLink className="w-4 h-4 text-purple-300 group-hover:text-purple-100" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Books */}
                <div>
                    <h3 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Books & Reading
                    </h3>
                    <div className="space-y-2">
                        {resources.books.map((book, idx) => (
                            <a
                                key={idx}
                                href={book.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all group"
                            >
                                <span className="text-white">{book.name}</span>
                                <ExternalLink className="w-4 h-4 text-purple-300 group-hover:text-purple-100" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Communities */}
                <div>
                    <h3 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Communities
                    </h3>
                    <div className="space-y-2">
                        {resources.communities.map((community, idx) => (
                            <a
                                key={idx}
                                href={community.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all group"
                            >
                                <span className="text-white">
                                    {community.icon} {community.name}
                                </span>
                                <ExternalLink className="w-4 h-4 text-purple-300 group-hover:text-purple-100" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Project Ideas */}
                <div>
                    <h3 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Project Ideas
                    </h3>
                    <ul className="space-y-2">
                        {resources.projects.map((project, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                                <span className="text-purple-300 font-bold mt-0.5">{idx + 1}.</span>
                                <span className="text-white">{project}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
