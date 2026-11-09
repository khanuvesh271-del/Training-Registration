
namespace training.registration;

using { cuid, managed } from '@sap/cds/common';

entity Employees : cuid, managed {
    username   : String(100) not null;
    fullName   : String(120) not null;
    employeeID : String(100) not null;
    role       : String(20) default 'EMPLOYEE';
}

entity Trainers : cuid, managed {
    fullName : String(120) not null;
    email    : String(150);
    phone    : String(30);

    courses  : Association to many Courses
                   on courses.trainer = $self;
}

entity Courses : cuid, managed {
    title       : String(120) not null;
    description : String(1000);

    trainer     : Association to one Trainers not null;

    sessions    : Association to many Sessions
                      on sessions.course = $self;
}

entity Sessions : cuid, managed {
    @title: title
    title       : String(120) not null;
    description : String(1000);

    // Keep existing trainer field for compatibility
    trainer     : String(120);

    // New course relationship
    course      : Association to one Courses;

    startDate   : Date not null;
    endDate     : Date not null;
    location    : String(120);
    capacity    : Integer not null;
    status      : String(10) default 'OPEN';

    enrolments  : Association to many Enrolments
                      on enrolments.session = $self;
}

entity Enrolments : cuid, managed {
    session     : Association to one Sessions not null;
    employee    : Association to one Employees;
    employeeID  : String(100) not null;
    enrolledAt  : Timestamp;
    status      : String(12) default 'ACTIVE';
}
