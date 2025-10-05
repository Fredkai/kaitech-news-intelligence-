# Ansible Automation for AI Website Project

This directory contains Ansible playbooks and configuration for automating the deployment and management of the AI Website Project.

## 🗂️ Directory Structure

```
ansible/
├── README.md                 # This file
├── ansible.cfg              # Ansible configuration
├── requirements.yml         # Galaxy roles and collections
├── inventory/
│   └── hosts.yml           # Server inventory
├── playbooks/
│   ├── setup.yml           # Basic server setup
│   └── deploy.yml          # Application deployment
└── roles/                  # Custom roles (when created)
```

## 🔧 Prerequisites

1. **Install Ansible** (already done):
   ```bash
   pip install ansible
   ```

2. **Install Galaxy Requirements**:
   ```bash
   ansible-galaxy install -r requirements.yml
   ```

3. **Configure SSH Keys**: Ensure you have SSH access to your servers

## 📋 Inventory Configuration

Edit `inventory/hosts.yml` to match your infrastructure:

```yaml
production:
  hosts:
    web-server-1:
      ansible_host: YOUR_SERVER_IP
      ansible_user: ubuntu
      ansible_ssh_private_key_file: ~/.ssh/your_key
```

## 🚀 Playbook Usage

### 1. Basic Server Setup
Prepares servers with essential packages, Node.js, and Nginx:

```bash
ansible-playbook -i inventory/hosts.yml playbooks/setup.yml
```

### 2. Application Deployment
Deploys the AI website application:

```bash
ansible-playbook -i inventory/hosts.yml playbooks/deploy.yml
```

### 3. Target Specific Environment
Run against specific inventory groups:

```bash
# Production only
ansible-playbook -i inventory/hosts.yml playbooks/deploy.yml --limit production

# Staging only  
ansible-playbook -i inventory/hosts.yml playbooks/deploy.yml --limit staging

# Single host
ansible-playbook -i inventory/hosts.yml playbooks/deploy.yml --limit web-server-1
```

## 🔐 Security Notes

- Store sensitive variables in `ansible-vault`
- Never commit private keys to version control
- Use separate SSH keys for different environments
- Enable firewall rules through the playbooks

## 📝 Common Variables

Key variables that can be overridden:

- `project_name`: Name of the project (default: ai-website-project)
- `app_directory`: Application installation path
- `domain_name`: Your domain name for SSL/virtual host
- `ssl_enabled`: Enable SSL certificates (default: false)

## 🛠️ Example Commands

```bash
# Check connectivity to all hosts
ansible all -i inventory/hosts.yml -m ping

# Run setup on staging environment
ansible-playbook -i inventory/hosts.yml playbooks/setup.yml --limit staging

# Deploy with custom domain
ansible-playbook -i inventory/hosts.yml playbooks/deploy.yml -e "domain_name=yourdomain.com"

# Dry run (check mode)
ansible-playbook -i inventory/hosts.yml playbooks/deploy.yml --check
```

## 🏗️ Next Steps

1. Configure your server IPs in `inventory/hosts.yml`
2. Set up SSH key authentication
3. Run the setup playbook to prepare your servers
4. Deploy your application using the deploy playbook
5. Set up SSL certificates for production

## 📚 Additional Resources

- [Ansible Documentation](https://docs.ansible.com/)
- [Ansible Galaxy](https://galaxy.ansible.com/)
- [Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)