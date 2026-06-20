# Shopfloor Planning Software Plan

This software will help manage a factory shopfloor by showing machines, assigning operators, planning shifts, tracking production, and handling alerts in one system [cite:1][cite:2].

## Goal

Create a system where supervisors and planners can see the whole shopfloor, know machine status, manage operator involvement, and keep production moving with fewer delays [cite:3][cite:5].

## Main Features

- **Machine viewing**: show all machines with live status such as running, idle, stopped, maintenance, or breakdown.
- **Operator involvement**: track operator skills, availability, shift, and current assignment.
- **Production planning**: create jobs, assign them to machines, and set priority and deadline.
- **Shift planning**: manage shifts, breaks, handovers, overtime, and leave.
- **Order tracking**: connect customer orders to jobs and monitor progress.
- **Quality checks**: record inspection results, defects, and rework.
- **Maintenance planning**: schedule preventive maintenance and log machine issues.
- **Alerts and notifications**: warn about machine failure, operator shortage, late jobs, and bottlenecks.

## Core Screens

| Screen | Purpose |
|---|---|
| Dashboard | Overall shopfloor status |
| Machine View | Machine list, status, and history |
| Operator View | Skills, shifts, and assignments |
| Planning Board | Job allocation and scheduling |
| Shift Planner | Shift setup and manpower planning |
| Alerts Panel | Breakdown and delay notifications |
| Reports | Utilization, downtime, output, and efficiency |

## Important Data

- **Machine**: id, name, type, status, location, maintenance due.
- **Operator**: id, name, skills, shift, availability, assigned machine.
- **Job**: id, order id, machine requirement, operator requirement, priority, status.
- **Order**: id, customer, due date, quantity, progress.
- **Shift**: id, start time, end time, assigned operators.
- **Maintenance Record**: machine id, issue, start time, end time, status.
- **Quality Record**: job id, defect type, result, remarks.
- **Alert**: type, severity, source, time, resolved or not.

## Planning Logic

The system should decide based on:
- machine availability,
- operator skill match,
- shift timing,
- job priority,
- due date,
- maintenance condition,
- production sequence.

For example, if two machines can do the same job, the system should prefer the one with better availability and lower setup time [cite:1][cite:5].

## Workflow

1. Create an order.
2. Break it into jobs or operations.
3. Match jobs with suitable machines.
4. Assign trained operators.
5. Check shift and availability.
6. Start production.
7. Track progress and delays.
8. Update the plan when breakdowns or shortages happen.

## MVP Scope

The first version should include:
- machine list and status,
- operator list and skill mapping,
- job assignment,
- shift planning,
- basic dashboard,
- alerts,
- simple reports.

This is enough to build a working shopfloor planning system before adding advanced simulation or optimization features [cite:1][cite:2].

## Future Additions

- Live IoT machine updates.
- Drag-and-drop planning board.
- Bottleneck analysis.
- What-if simulation.
- Role-based access.
- Custom factory templates and node-based planning [cite:4][cite:5].
