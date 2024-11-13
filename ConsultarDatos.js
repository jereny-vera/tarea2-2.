// src/components/ConsultarDatos.js
// Importamos React y los hooks necesarios para gestionar el estado y los efectos.
import React, { useEffect, useState } from 'react';
import { xml2js } from 'xml-js'; // Librería para convertir XML a JSON

const ConsultarDatos = () => {
  // Definición de los estados locales
  const [personasJSON, setPersonasJSON] = useState([]); // Almacena personas del archivo JSON
  const [personasXML, setPersonasXML] = useState([]); // Almacena personas del archivo XML
  const [personasLocalStorage, setPersonasLocalStorage] = useState([]); // Almacena personas de localStorage
  const [searchQuery, setSearchQuery] = useState(''); // Almacena el término de búsqueda del usuario
  const [filteredPersonas, setFilteredPersonas] = useState([]); // Almacena el resultado de búsqueda

  // useEffect para cargar datos desde JSON al montar el componente
  useEffect(() => {
    fetch('/data/personas.json') // Ruta del archivo JSON
      .then((response) => response.json()) // Convertir respuesta a JSON
      .then((data) => {
        setPersonasJSON(data); // Guardar los datos JSON en el estado personasJSON
      })
      .catch((error) => console.error("Error al cargar JSON:", error));
  }, []);

  // useEffect para cargar datos desde XML al montar el componente
  useEffect(() => {
    fetch('/data/personas.xml') // Ruta del archivo XML
      .then((response) => response.text()) // Convertir respuesta a texto
      .then((xmlText) => {
        const jsonData = xml2js(xmlText, { compact: true }); // Convertir XML a JSON
        const personasArray = jsonData.personas.persona.map((item) => ({
          id: item.id._text,
          nombre: item.nombre._text,
          edad: item.edad._text,
          capacidad: item.capacidad._text,
          email: item.email._text,
        }));
        setPersonasXML(personasArray); // Guardar los datos XML convertidos en personasXML
      })
      .catch((error) => console.error("Error al cargar XML:", error));
  }, []);

  // useEffect para cargar datos de personas registradas en localStorage
  useEffect(() => {
    const personasRegistradas = JSON.parse(localStorage.getItem("personas")) || [];
    setPersonasLocalStorage(personasRegistradas); // Guardar personas en personasLocalStorage
  }, []);

  // Función para realizar la búsqueda en todos los datos cargados (validaciones)
  const handleSearch = () => {
    const searchLower = searchQuery.toLowerCase(); // Convertir búsqueda a minúsculas

    // Filtrar resultados que contengan el término de búsqueda en distintos campos
    const filteredData = [
      ...personasLocalStorage,
      ...personasJSON,
      ...personasXML,
    ].filter((persona) =>
      persona.nombre?.toLowerCase().includes(searchLower) ||
      persona.apellido?.toLowerCase().includes(searchLower) ||
      persona.direccion?.toLowerCase().includes(searchLower) ||
      persona.discapacidad?.toLowerCase().includes(searchLower)
    );

    // Guardar los resultados en localStorage para conservar los resultados en futuras consultas
    const currentResults = JSON.parse(localStorage.getItem("resultadosBusqueda")) || [];
    const updatedResults = [...currentResults, ...filteredData];
    localStorage.setItem("resultadosBusqueda", JSON.stringify(updatedResults));

    // Actualizar estado con los resultados encontrados
    setFilteredPersonas(updatedResults);
  };

  // useEffect para cargar resultados previos guardados en localStorage
  useEffect(() => {
    const storedResults = JSON.parse(localStorage.getItem("resultadosBusqueda")) || [];
    setFilteredPersonas(storedResults);
  }, []);

  // Función para eliminar una persona de los resultados de búsqueda
  const handleDelete = (id) => {
    // Filtrar resultados y eliminar la persona que coincida con el id
    const updatedResults = filteredPersonas.filter(persona => persona.id !== id);
    
    // Actualizar el estado y el localStorage con los resultados restantes
    setFilteredPersonas(updatedResults);
    localStorage.setItem("resultadosBusqueda", JSON.stringify(updatedResults)); 
  };

  // Función para editar datos de una persona
  const handleEdit = (id) => {
    const updatedResults = [...filteredPersonas]; // Crear una copia de los resultados actuales
    const personaIndex = updatedResults.findIndex(persona => persona.id === id); // Buscar la persona a editar
    
    if (personaIndex !== -1) { // Si se encuentra la persona(validaciones al editar un registro)
      const nombreNuevo = prompt("Nuevo nombre", updatedResults[personaIndex].nombre);
      const apellidoNuevo = prompt("Nuevo apellido", updatedResults[personaIndex].apellido);

      // Si el usuario ingresa nuevos datos, actualizarlos en el estado y el localStorage
      if (nombreNuevo && apellidoNuevo) {
        updatedResults[personaIndex].nombre = nombreNuevo;
        updatedResults[personaIndex].apellido = apellidoNuevo;
        setFilteredPersonas(updatedResults);
        localStorage.setItem("resultadosBusqueda", JSON.stringify(updatedResults));
      }
    }
  };

  return (
    <div>
      <h2>Consultar Datos</h2>
      
      {/* Sección para ingresar un término de búsqueda */}
      <h3>Buscar Personas</h3>
      <input
        type="text"
        placeholder="Buscar por nombre, apellido, dirección o discapacidad"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Buscar</button>

      {/* Mostrar resultados de búsqueda en una tabla */}
      {filteredPersonas.length > 0 && (
        <div>
          <h3>Resultados de la Búsqueda</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Edad</th>
                <th>Dirección</th>
                <th>Discapacidad</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonas.map((persona, index) => (
                <tr key={index}>
                  <td>{persona.nombre}</td>
                  <td>{persona.apellido}</td>
                  <td>{persona.edad}</td>
                  <td>{persona.direccion}</td>
                  <td>{persona.discapacidad}</td>
                  <td>{persona.telefono}</td>
                  <td>
                    {/* Botones para eliminar o editar cada registro */}
                    <button onClick={() => handleDelete(persona.id)}>Eliminar</button>
                    <button onClick={() => handleEdit(persona.id)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mostrar datos desde el archivo JSON */}
      <h3>Datos desde JSON</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Capacidad</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {personasJSON.map((persona) => (
            <tr key={persona.id}>
              <td>{persona.nombre}</td>
              <td>{persona.edad}</td>
              <td>{persona.capacidad}</td>
              <td>{persona.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mostrar datos desde el archivo XML */}
      <h3>Datos desde XML</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Capacidad</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {personasXML.map((persona) => (
            <tr key={persona.id}>
              <td>{persona.nombre}</td>
              <td>{persona.edad}</td>
              <td>{persona.capacidad}</td>
              <td>{persona.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mostrar datos desde localStorage */}
      <h3>Datos desde LocalStorage</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Edad</th>
            <th>Dirección</th>
            <th>Discapacidad</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {personasLocalStorage.map((persona, index) => (
            <tr key={index}>
              <td>{persona.nombre}</td>
              <td>{persona.apellido}</td>
              <td>{persona.edad}</td>
              <td>{persona.direccion}</td>
              <td>{persona.discapacidad}</td>
              <td>{persona.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsultarDatos;
