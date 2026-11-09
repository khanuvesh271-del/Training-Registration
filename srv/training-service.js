
import cds from '@sap/cds';

export default class TrainingService extends cds.ApplicationService {
    async init() {
        const { Enrolments, Sessions } = this.entities;
        const { Employees } = cds.entities('training.registration');
        

// Resolve the logged-in CAP user to an employee record
const getCurrentEmployee = async (req) => {
    const username = req.user.id;

    if (!username || username === 'anonymous') {
        return req.reject(401, 'Authentication required.');
    }

    const employee = await SELECT.one
        .from(Employees)
        .where({ username });

    if (!employee) {
        return req.reject(
            403,
            'No employee account is linked to this user.'
        );
    }

    return employee;
};
// Allow only administrators to perform administrative operations
const requireAdmin = async (req) => {
    const employee = await getCurrentEmployee(req);

    if (employee.role !== 'ADMIN') {
        return req.reject(
            403,
            'Administrator access required.'
        );
    }

    return employee;
};
// Add employee display names to enrolment records
// Add employee and audit display names to enrolment records
this.after('READ', 'Enrolments', async (enrolments) => {
    if (!enrolments) return;

    const list = Array.isArray(enrolments)
        ? enrolments
        : [enrolments];

    const employees = await SELECT
        .from(Employees)
        .columns('employeeID', 'username', 'fullName');

    const namesByEmployeeID = Object.fromEntries(
        employees.map(e => [e.employeeID, e.fullName])
    );

    const namesByUsername = Object.fromEntries(
        employees.map(e => [e.username, e.fullName])
    );

    for (const enrolment of list) {
        enrolment.employeeName =
            namesByEmployeeID[enrolment.employeeID] || 'Unknown';

        enrolment.createdByName =
            namesByUsername[enrolment.createdBy] || enrolment.createdBy;

        enrolment.modifiedByName =
            namesByUsername[enrolment.modifiedBy] || enrolment.modifiedBy;
    }
});
        // Calculate enrolled employees and available seats
        this.after('READ', 'Sessions', async (sessions, req) => {
            if (!sessions) return;

            const sessionList = Array.isArray(sessions)
                ? sessions
                : [sessions];
                const employee = await getCurrentEmployee(req);
const isAdmin = employee.role === 'ADMIN';

for (const session of sessionList) {
    session.isAdmin = isAdmin;
}

            const sessionIDs = sessionList
                .map(session => session.ID)
                .filter(Boolean);

            if (!sessionIDs.length) return;

            const sessionCapacities = await SELECT
                .from(Sessions)
                .columns('ID', 'capacity')
                .where({ ID: { in: sessionIDs } });

            const capacities = {};

            for (const session of sessionCapacities) {
                capacities[session.ID] = session.capacity;
            }

            const activeEnrolments = await SELECT
                .from(Enrolments)
                .columns('session_ID')
                .where({
                    status: 'ACTIVE',
                    session_ID: { in: sessionIDs }
                });

            const counts = {};

            for (const enrolment of activeEnrolments) {
                counts[enrolment.session_ID] =
                    (counts[enrolment.session_ID] || 0) + 1;
            }

            for (const session of sessionList) {
                session.enrolledCount = counts[session.ID] || 0;

                session.availableSeats = Math.max(
                    0,
                    (capacities[session.ID] ?? 0) -
                    session.enrolledCount
                );
            }
        });

        // Prevent direct deletion of enrolments
       // Restrict employees to viewing their own enrolments
this.before('READ', 'Enrolments', async (req) => {
    const employee = await getCurrentEmployee(req);

    // Administrators can view all enrolments
    if (employee.role === 'ADMIN') return;

    // Employees can view only their own ACTIVE enrolments
    req.query.where({
        employeeID: employee.employeeID,
        status: 'ACTIVE'
    });
});
        // Shared registration validation
        const validateEnrolment = async (req) => {
            const { session_ID, employeeID } = req.data;

            if (!session_ID || !employeeID) {
                return req.reject(
                    400,
                    'Session ID and Employee ID are required.'
                );
            }

            const session = await SELECT.one
                .from(Sessions)
                .where({ ID: session_ID });

            if (!session) {
                return req.reject(404, 'Training session not found.');
            }

            if (!['OPEN', 'FULL'].includes(session.status)) {
                return req.reject(
                    400,
                    'This training session is closed.'
                );
            }

            const duplicate = await SELECT.one
                .from(Enrolments)
                .where({
                    session_ID,
                    employeeID,
                    status: 'ACTIVE'
                });

            if (duplicate) {
                return req.reject(
                    409,
                    'You are already enrolled in this session.'
                );
            }

            const activeEnrolments = await SELECT
                .from(Enrolments)
                .where({
                    session_ID,
                    status: 'ACTIVE'
                });

            if (activeEnrolments.length >= session.capacity) {
                return req.reject(
                    409,
                    'This training session is full.'
                );
            }

            return {
                session_ID,
                employeeID,
                status: 'ACTIVE',
                enrolledAt: new Date()
            };
        };

        // Update session status when capacity changes
        const updateSessionCapacity = async (sessionID) => {
            const session = await SELECT.one
                .from(Sessions)
                .where({ ID: sessionID });

            if (!session || session.status === 'CLOSED') return;

            const activeEnrolments = await SELECT
                .from(Enrolments)
                .where({
                    session_ID: sessionID,
                    status: 'ACTIVE'
                });

            const count = activeEnrolments.length;

            if (count >= session.capacity && session.status === 'OPEN') {
                await UPDATE(Sessions)
                    .set({ status: 'FULL' })
                    .where({ ID: sessionID });
            }

            if (count < session.capacity && session.status === 'FULL') {
                await UPDATE(Sessions)
                    .set({ status: 'OPEN' })
                    .where({ ID: sessionID });
            }
        };

        // Validate direct enrolment creation
        // Validate direct enrolment creation
// Prevent direct updates to enrolment records
this.before('UPDATE', 'Enrolments', (req) => {
    return req.reject(
        403,
        'Direct enrolment updates are not allowed. Use the available actions.'
    );
});
        // Register for training
       // Register for training
this.on('registerForTraining', 'Sessions', async (req) => {
    const sessionID = req.params[0].ID;

    // Identify the authenticated employee
    const employee = await getCurrentEmployee(req);

    const enrolmentData = await validateEnrolment({
        data: {
            session_ID: sessionID,
            employeeID: employee.employeeID
        },
        reject: req.reject.bind(req)
    });

    // Link the enrolment to the actual Employees database record
    enrolmentData.employee_ID = employee.ID;

  const result = await INSERT.into(Enrolments)
    .entries(enrolmentData);

await updateSessionCapacity(sessionID);

// Show registration success message
req.info('Successfully registered for training!');

return result;
});

        // Close a training session
        this.on('closeSession', 'Sessions', async (req) => {
            await requireAdmin(req);
            const sessionID = req.params[0].ID;

            const session = await SELECT.one
                .from(Sessions)
                .where({ ID: sessionID });

            if (!session) {
                return req.reject(404, 'Training session not found.');
            }

            if (session.status === 'CLOSED') {
                return req.reject(
                    400,
                    'This session is already closed.'
                );
            }

            await UPDATE(Sessions)
                .set({ status: 'CLOSED' })
                .where({ ID: sessionID });

            return await SELECT.one
                .from(Sessions)
                .where({ ID: sessionID });
        });

        // Reopen a training session
        this.on('reopenSession', 'Sessions', async (req) => {
            await requireAdmin(req);
            const sessionID = req.params[0].ID;

            const session = await SELECT.one
                .from(Sessions)
                .where({ ID: sessionID });

            if (!session) {
                return req.reject(404, 'Training session not found.');
            }

            if (session.status !== 'CLOSED') {
                return req.reject(
                    400,
                    'Only closed sessions can be reopened.'
                );
            }

            const activeEnrolments = await SELECT
                .from(Enrolments)
                .where({
                    session_ID: sessionID,
                    status: 'ACTIVE'
                });

            if (activeEnrolments.length >= session.capacity) {
                return req.reject(
                    409,
                    'Cannot reopen this session because it is full.'
                );
            }

            await UPDATE(Sessions)
                .set({ status: 'OPEN' })
                .where({ ID: sessionID });

            return await SELECT.one
                .from(Sessions)
                .where({ ID: sessionID });
        });

        // Cancel an enrolment
       // Cancel an enrolment
this.on('cancel', 'Enrolments', async (req) => {
    const ID = req.params[0].ID;
    const employee = await getCurrentEmployee(req);

    const enrolment = await SELECT.one
        .from(Enrolments)
        .where({ ID });

    if (!enrolment) {
        return req.reject(404, 'Enrolment not found.');
    }

    // Employees can cancel only their own enrolments.
    // Administrators can cancel any enrolment.
    if (
        employee.role !== 'ADMIN' &&
        enrolment.employeeID !== employee.employeeID
    ) {
        return req.reject(
            403,
            'You are not authorized to cancel this enrolment.'
        );
    }

    if (enrolment.status === 'CANCELLED') {
        return req.reject(
            400,
            'This enrolment is already cancelled.'
        );
    }

    await UPDATE(Enrolments)
        .set({ status: 'CANCELLED' })
        .where({ ID });

    await updateSessionCapacity(enrolment.session_ID);

    return await SELECT.one
        .from(Enrolments)
        .where({ ID });
});
    // Admin dashboard statistics
this.on('getDashboardStats', async (req) => {
    await requireAdmin(req);

    const sessions = await SELECT
        .from(Sessions)
        .columns('ID', 'capacity', 'status');

    const activeEnrolments = await SELECT
        .from(Enrolments)
        .columns('session_ID')
        .where({ status: 'ACTIVE' });

    const employees = await SELECT
        .from(Employees)
        .columns('ID');

    // Count active enrolments per session
    const enrolmentCounts = {};

    for (const enrolment of activeEnrolments) {
        enrolmentCounts[enrolment.session_ID] =
            (enrolmentCounts[enrolment.session_ID] || 0) + 1;
    }

    // Calculate available seats, excluding closed sessions
    let availableSeats = 0;

    for (const session of sessions) {
        if (session.status !== 'CLOSED') {
            const enrolled = enrolmentCounts[session.ID] || 0;

            availableSeats += Math.max(
                0,
                session.capacity - enrolled
            );
        }
    }

    return {
        totalSessions: sessions.length,
        activeEnrolments: activeEnrolments.length,
        totalEmployees: employees.length,
        availableSeats
    };
});
        return super.init();
    }
}
