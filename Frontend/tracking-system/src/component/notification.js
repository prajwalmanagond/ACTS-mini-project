import React from 'react';
import { Button, Card } from 'react-bootstrap';

const NotificationItem = ({ task, onMarkAsRead, onSnooze }) => {
  return (
    <Card className="mb-2">
      <Card.Body>
        <Card.Title>{task.title}</Card.Title>
        <Card.Text>
          <strong>End Date:</strong> {new Date(task.endDate).toLocaleDateString()}
        </Card.Text>
        <Button variant="success" onClick={() => onMarkAsRead(task._id)}>
          Mark as Read
        </Button>
        <Button variant="warning" className="ml-2" onClick={() => onSnooze(task._id)}>
          Snooze
        </Button>
      </Card.Body>
    </Card>
  );
};

export default NotificationItem;
