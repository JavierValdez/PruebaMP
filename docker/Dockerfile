FROM mcr.microsoft.com/azure-sql-edge:1.0.7

# Set environment variables
ENV ACCEPT_EULA=Y
ENV MSSQL_PID=Developer
ENV MSSQL_SA_PASSWORD=StrongP@ssword123

# Create app directory
WORKDIR /usr/src/app

# Copy initialization scripts
COPY ./init-scripts/ /usr/src/app/

# Give permissions to the scripts
USER root
RUN chmod +x /usr/src/app/entrypoint.sh
USER mssql

# Expose SQL Server port
EXPOSE 1433

# Set entrypoint
CMD ["/bin/bash", "./entrypoint.sh"]
