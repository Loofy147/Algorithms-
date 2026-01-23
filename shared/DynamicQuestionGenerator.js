// shared/DynamicQuestionGenerator.js

/**
 * ENHANCED: Anytime Dynamic Question Generator
 * Uses the Anytime principle to yield questions progressively within a time budget.
 */
class DynamicQuestionGenerator {
    constructor(integrations) {
        this.integrations = integrations;
    }

    async generateAll(db, timeBudgetMs = 5000) {
        const startTime = Date.now();
        let total = 0;
        const generatedQuestions = [];

        // Define tasks for each integration
        const tasks = [];
        for (const integration of this.integrations) {
            const methods = [
                'generateQuestionsFromContacts',
                'generateQuestionsFromCallHistory',
                'generateQuestionsFromCalendar',
                'generateQuestionsFromDrive'
            ];

            for (const method of methods) {
                if (integration[method]) {
                    tasks.push(async () => {
                        const qs = await integration[method](db);
                        return qs;
                    });
                }
            }
        }

        // Process tasks until budget is exhausted
        for (const task of tasks) {
            if (Date.now() - startTime > timeBudgetMs) {
                console.log('Time budget exhausted for question generation, returning current results.');
                break;
            }

            try {
                const qs = await task();
                generatedQuestions.push(...qs);
                total += qs.length;
            } catch (err) {
                console.error('Error in question generation task:', err);
            }
        }

        return total;
    }
}

export default DynamicQuestionGenerator;
