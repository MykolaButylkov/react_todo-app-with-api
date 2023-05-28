/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';

import { UserWarning } from './UserWarning';
import { Todo } from './types/Todo';
import {
  createTodo, getTodos, deleteTodo, updateTodo,
} from './api/todos';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Main } from './components/Main/Main';
import { ErrorMessages } from './components/ErrorMessages/ErrorMessages';

const USER_ID = 10548;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('all');
  const [disableInput, setDisableInput] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>();
  const [hasError, setHasError] = useState(false);
  const [typeError, setTypeError] = useState('');
  const [hasEditTodo, setHasEditTodo] = useState(false);
  const [todoForUpdate, setTodoForUpdate] = useState<Todo | null>(null);
  const [idUpdatedTodo, setIdUpdatedTodo] = useState(0);

  async function loadedTodos(f: (USER_ID: number) => Promise<Todo[]>) {
    try {
      const result = await f(USER_ID);

      setTodos(result);
      setHasError(false);
    } catch (error) {
      setTypeError('Unable to load a todo');
      setHasError(true);
    }
  }

  useEffect(() => {
    loadedTodos(getTodos);
  }, []);

  const handleChangeInput = (event : React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleStatus = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    setStatus(event.currentTarget.type);
  };

  const handleAddTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIdUpdatedTodo(todos.length);
    setDisableInput(true);
    setTempTodo({
      id: 0,
      userId: USER_ID,
      title: input,
      completed: false,
    });

    setInput('');
    try {
      await createTodo(USER_ID, {
        title: input,
        userId: USER_ID,
        completed: false,
      });

      await loadedTodos(getTodos);
      setTempTodo(null);
      setDisableInput(false);
      setIdUpdatedTodo(0);
      setHasError(false);
    } catch (error) {
      setTypeError('Unable to add a todo');
      setHasError(true);
    }
  };

  const handleUpdateTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (todoForUpdate) {
      setTempTodo({
        id: 0,
        userId: USER_ID,
        title: todoForUpdate.title,
        completed: todoForUpdate.completed,
      });

      await updateTodo(todoForUpdate.id, {
        title: todoForUpdate.title,
        completed: todoForUpdate.completed,
      });
      setHasEditTodo(false);
      setTempTodo(null);
      setTodoForUpdate(null);
    }
  };

  const handleRemoveTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      loadedTodos(getTodos);
      setHasError(false);
    } catch (error) {
      setTypeError('Unable to delete a todo');
      setHasError(true);
    }
  };

  const visibleTodos = todos.filter((todo) => {
    switch (status) {
      case 'active':
        return !todo.completed;

      case 'completed':
        return !!todo.completed;

      case 'all':
      default:
        return true;
    }
  });

  (function handleTempTodo() {
    if (tempTodo) {
      visibleTodos.splice(idUpdatedTodo, 1, tempTodo);
    }
  }());

  // for (const todo of visibleTodos) {
  //   deleteTodo(todo.id);
  // }

  // eslint-disable-next-line max-len
  const handleEditTodo = (
    event: React.ChangeEvent<HTMLInputElement>,
    todoId: number,
  ) => {
    // setUpdatedText(`${todoTitle}${event.target.value}`);
    setTodos(todos.map((todo) => {
      if (todo.id !== todoId) {
        return todo;
      }

      if (event.type === 'checkbox') {
        setTodoForUpdate({ ...todo, completed: !todo.completed });

        return { ...todo, completed: !todo.completed };
      }

      setTodoForUpdate({ ...todo, title: event.target.value });

      return { ...todo, title: event.target.value };
    }));
  };

  const itemsLeftCount = visibleTodos.filter(todo => !todo.completed).length;

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          countActiveTodo={itemsLeftCount}
          inputValue={input}
          onHandleInput={handleChangeInput}
          onHandleAddTodo={handleAddTodo}
          disabeled={disableInput}
        />

        <Main
          visibleTodos={visibleTodos}
          onRemoveTodo={handleRemoveTodo}
          tempTodo={tempTodo}
          onEditTodo={handleEditTodo}
          hasEditTodo={hasEditTodo}
          setHasEditTodo={setHasEditTodo}
          onUpdateTodo={handleUpdateTodo}
          setIdUpdatedTodo={setIdUpdatedTodo}
          idUpdatedTodo={idUpdatedTodo}
        />

        {/* Hide the footer if there are no todos */}
        {!!itemsLeftCount && (
          <Footer
            selectedStatus={status}
            onHandleStatus={handleStatus}
            itemsLeftCount={itemsLeftCount}
          />
        )}

      </div>

      {/* Notification is shown in case of any error */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      {hasError && <ErrorMessages typeError={typeError} />}
    </div>
  );
};
