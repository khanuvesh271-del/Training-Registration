
using { training.registration as db } from '../db/schema';

@path: '/training'
service TrainingService {
        type DashboardStats {
        totalSessions    : Integer;
        activeEnrolments : Integer;
        totalEmployees   : Integer;
        availableSeats   : Integer;
    }

    function getDashboardStats() returns DashboardStats;

    entity Sessions as projection on db.Sessions {
    *,
    virtual enrolledCount : Integer,
    virtual availableSeats : Integer,
    virtual isAdmin : Boolean
} actions {
        action registerForTraining() returns Enrolments;

        action closeSession() returns Sessions;

        action reopenSession() returns Sessions;
    };

  entity Enrolments as projection on db.Enrolments {
    *,
    virtual employeeName : String(120),
    virtual createdByName : String(120),
    virtual modifiedByName : String(120)
} actions {
    action cancel() returns Enrolments;
};
}
