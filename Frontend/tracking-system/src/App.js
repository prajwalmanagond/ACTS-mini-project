import React, { useState, useEffect } from "react";
import { Navbar, Nav, Button, Dropdown, Container, Row, Col, Card, Form, Modal } from "react-bootstrap";
import { FaBell, FaEdit, FaTrash, FaCheckCircle, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import NotificationItem from './component/notification';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/tasks'; // Your backend URL

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);  // State for Add Task Modal
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);  // State for Edit Task Modal
  const [currentTask, setCurrentTask] = useState(null);  // Task being edited
  const [newTask, setNewTask] = useState({ title: '', description: '', endDate: '', status: 'Upcoming' });

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Handle input change for the new task form
  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  // Handle adding a new task
  const handleAddTask = async () => {
    try {
      const response = await axios.post(API_URL, newTask);
      setTasks([...tasks, response.data]);  // Add the new task to the task list
      setShowAddTaskModal(false);  // Close the modal after task creation
      setNewTask({ title: '', description: '', endDate: '', status: 'Upcoming' });  // Reset form
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(task => task._id !== id));  // Remove the task from the list
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Open the Edit Task Modal with the current task's data
  const handleEditClick = (task) => {
    setCurrentTask(task);  // Set the current task being edited
    setShowEditTaskModal(true);  // Open the Edit Task Modal
  };

  // Handle updating the task (edit task)
  const handleEditInputChange = (e) => {
    setCurrentTask({ ...currentTask, [e.target.name]: e.target.value });
  };

  // Handle submitting the edited task
  const handleEditSubmit = async () => {
    try {
      await axios.put(`${API_URL}/${currentTask._id}`, currentTask);
      setTasks(tasks.map(task => task._id === currentTask._id ? currentTask : task));  // Update the task in the task list
      setShowEditTaskModal(false);  // Close the Edit Task Modal
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

 

  return (
    <Router>
      <Header />
      <NavTabs />
      <Container className="mt-4">
        {/* Add New Task Button */}
        <Button variant="primary" onClick={() => setShowAddTaskModal(true)}>
          <FaPlus /> Add New Task
        </Button>

        {/* Task List */}
        <Routes>
          <Route path="/dashboard"
          element= { <TaskList tasks={tasks} onDelete={handleDeleteTask} onEdit={handleEditClick} />}
          />
          {/* Filtered routes */}
          <Route path="/upcoming"
           element={<TaskList tasks={tasks.filter(task => task.status === 'Upcoming')} onDelete={handleDeleteTask} onEdit={handleEditClick} />}
          />
          <Route path="/completed"
          element={<TaskList tasks={tasks.filter(task => task.status === 'Completed')} onDelete={handleDeleteTask} onEdit={handleEditClick} />}
          />
          <Route path="/overdue"
           element={<TaskList tasks={tasks.filter(task => task.status === 'Overdue')} onDelete={handleDeleteTask} onEdit={handleEditClick} />
  }        />
        </Routes>
      </Container>

      {/* Add Task Modal */}
      <Modal show={showAddTaskModal} onHide={() => setShowAddTaskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter task description"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={newTask.endDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
              >
                <option>Upcoming</option>
                <option>Completed</option>
                <option>Overdue</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddTaskModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddTask}>
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Task Modal */}
      <Modal show={showEditTaskModal} onHide={() => setShowEditTaskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTask && (
            <Form>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={currentTask.title}
                  onChange={handleEditInputChange}
                  placeholder="Enter task title"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={currentTask.description}
                  onChange={handleEditInputChange}
                  rows={3}
                  placeholder="Enter task description"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={currentTask.endDate.split('T')[0]} // Format for HTML date input
                  onChange={handleEditInputChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  name="status"
                  value={currentTask.status}
                  onChange={handleEditInputChange}
                >
                  <option>Upcoming</option>
                  <option>Completed</option>
                  <option>Overdue</option>
                </Form.Control>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditTaskModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Router>
  );
};

// Task List Component
const TaskList = ({ tasks, onDelete, onEdit }) => (
  <Row className="mt-4">
    {tasks.map(task => (
      <Col key={task._id} xs={12} sm={6} md={4}>
        <TaskCard task={task} onDelete={onDelete} onEdit={onEdit} />
      </Col>
    ))}
  </Row>
);

// Task Card Component
const TaskCard = ({ task, onDelete, onEdit }) => {
  const statusVariant = {
    "Upcoming": "warning",
    "Completed": "success",
    "Overdue": "danger"
  };

   // Handle task status update based on conditions
const handleStatusUpdate = (task) => {
  const now = new Date();
  const endDate = new Date(task.endDate);

  if (task.status === 'Completed') {
    // Change status back to Upcoming if the end date is not reached
    if (now < endDate) {
      updateTaskStatus(task._id, 'Upcoming');
    } else {
      updateTaskStatus(task._id, 'Overdue');
    }
  } else {
    updateTaskStatus(task._id, 'Completed');
  }
};

const updateTaskStatus = async (fetchTasks,id, status) => {
  try {
    await axios.put(`${API_URL}/${id}`, { status });
    fetchTasks();
  } catch (error) {
    console.error("Error updating task status:", error);
  }
};


  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{task.title}</Card.Title>
        <Card.Text>{task.description}</Card.Text>
        <Card.Text><strong>Created Date:</strong> {new Date(task.createdDate).toLocaleDateString()}</Card.Text>
        <Card.Text><strong>End Date:</strong> {new Date(task.endDate).toLocaleDateString()}</Card.Text>
        <Card.Text>
          <strong>Status:</strong> 
          <span className={`text-${statusVariant[task.status]} ml-2`}>
            {task.status}
          </span>
        </Card.Text>
        <div className="d-flex justify-content-between">
                  <Button
            variant={task.status === 'Completed' ? "outline-warning" : "outline-success"}
            onClick={() => handleStatusUpdate(task)}
          >
            {task.status === 'Completed' ? 'Revert to Upcoming' : <><FaCheckCircle /> Mark Complete</>}
          </Button>

          <Button variant="outline-success" onClick={() => onEdit(task)}>
            <FaEdit /> Edit
          </Button>
          <Button variant="outline-danger" onClick={() => onDelete(task._id)}>
            <FaTrash /> Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// Header Component


const Header = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    // Listen for notifications from the backend
    socket.on('notify', (tasks) => {
      setNotifications(tasks);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Mark a task as read
  const handleMarkAsRead = (id) => {
    setNotifications(notifications.filter(task => task._id !== id));
  };

  // Snooze a notification
  const handleSnooze = (id) => {
    console.log(`Snoozed task with ID: ${id}`);
  };

  return (
    <Navbar bg="light" expand="lg" className="p-3">
      <Navbar.Brand href="#">Task Manager</Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        <Dropdown alignRight>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          <FaBell/> Notifications
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {notifications.length > 0 ? (
              notifications.map(task => (
                <NotificationItem
                  key={task._id}
                  task={task}
                  onMarkAsRead={handleMarkAsRead}
                  onSnooze={handleSnooze}
                />
              ))
            ) : (
              <Dropdown.Item>No notifications</Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Collapse>
    </Navbar>
  );
};




// NavTabs Component
const NavTabs = () => (
  <Nav fill variant="tabs" defaultActiveKey="/dashboard">
    <Nav.Item>
      <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link as={Link} to="/upcoming">Upcoming</Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link as={Link} to="/completed">Completed</Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link as={Link} to="/overdue">Overdue</Nav.Link>
    </Nav.Item>
  </Nav>
);

export default App;
