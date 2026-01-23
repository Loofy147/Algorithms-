// shared/PatternDetector.enhanced.js
import { ProbabilisticCounter } from './algorithms/uncertainty-quantification/ProbabilisticCounter.js';

/**
 * ENHANCED: Pattern Detector with Uncertainty Quantification
 * Uses the Wilson Score interval to provide conservative confidence scores for detected patterns.
 */
export class PatternDetector {
    async analyzeResponses(db, profileId) {
        // Find high-frequency aspects in responses
        const aspectFrequency = db.prepare(`
            SELECT
                ao.aspect_id,
                q.primary_dimension_id,
                COUNT(*) as frequency,
                SUM(ao.weight) as total_strength,
                -- Count how many times the weight was above 0.5 (successes in reinforcing a pattern)
                SUM(CASE WHEN ao.weight >= 0.5 THEN 1 ELSE 0 END) as successes
            FROM responses r
            JOIN answer_options ao ON r.answer_option_id = ao.id
            JOIN questions q ON r.question_id = q.id
            WHERE r.profile_id = ?
              AND r.response_type = 'selected'
              AND ao.aspect_id IS NOT NULL
            GROUP BY ao.aspect_id, q.primary_dimension_id
            HAVING frequency >= 3
        `).all(profileId);

        if (!aspectFrequency || aspectFrequency.length === 0) {
            return 0;
        }

        const insertStmt = db.prepare(`
            INSERT INTO patterns (profile_id, pattern_type, dimension_id, aspect_id, confidence, strength, evidence_count, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(profile_id, dimension_id, aspect_id) WHERE dimension_id IS NOT NULL AND aspect_id IS NOT NULL
            DO UPDATE SET
                confidence = excluded.confidence,
                strength = excluded.strength,
                evidence_count = excluded.evidence_count,
                last_updated = CURRENT_TIMESTAMP
        `);

        const runUpdates = db.transaction((freqs) => {
            for (const af of freqs) {
                if (!af.aspect_id) continue;

                // ADVANCED: Use ProbabilisticCounter for Wilson Score confidence
                const counter = new ProbabilisticCounter();
                counter.trials = af.frequency;
                counter.successes = af.successes;

                // Use the lower bound of the Wilson interval as a conservative confidence measure
                const confidence = counter.getWilsonInterval().lower;
                const strength = af.total_strength / af.frequency;

                insertStmt.run(profileId, 'preference', af.primary_dimension_id, af.aspect_id, confidence, strength, af.frequency);
            }
        });

        runUpdates(aspectFrequency);

        return aspectFrequency.length;
    }
}
